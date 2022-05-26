import React, {useEffect, useState, useReducer} from "react";
import FancyTreeControl from "./FancyTreeControl";
import {TreeSelectMode} from "../IpaPageComponents/entities/EntitySelectionPanel";
import ScriptHelper from "../IpaUtils/ScriptHelper";
import {produce} from "immer";
import _, { set } from "lodash";
import {uid} from 'uid';
import {TreeNodeStatus} from "../IpaUtils/TreeHelpers";
import {parseNodeName, parseNode, stringifyNode} from "./private/tree";
import ReactiveTreeControl from "./ReactiveTreeControl";
import './TreeSearch.scss';

const treeControlLeafNodeRenderer = (group) => {
    return <div>{parseNodeName(group.name).displayName}{!!group.count && <span className="count" style={{fontSize: "0.8em"}}>{group.count}</span>}</div>;
}

const treeControlBranchNodeRenderer = (group) => {
    const childCount = group.count;
    
    return (
        <span>            
            {parseNodeName(group.name).displayName}
            {!!childCount && <span className="count" style={{fontSize: "0.8em"}}>{childCount}</span>}
          </span>
    )
};

const treeSearchReducer = (state, action) => {
    switch (action.type) {
        case 'reloading':
            return {...state, reloading: true, pristine: false};
        case 'reloaded':
            return {...state, reloading: false, nodeIndex: action.nodeIndex};
        case 'update_node':
            let nodeToUpdate = state.nodeIndex.find(action.id)
            if (nodeToUpdate === undefined) return state;
            return {
                ...state, 
                nodeIndex: {
                    ...state.nodeIndex, 
                    [action.id]: {...nodeToUpdate, ...action.node}
                }
            }
        default:
            return {...state, reloading: false, pristine: false, nodeIndex: action.nodeIndex ? action.nodeIndex : state.nodeIndex};
    }
}

const initialTreeState = {reloading: false, pristine: true, nodeIndex : {}};

export const TreeSearch = ({ currentValue = {}, currentState, onFetch, treeLevels, display, reloadToken }) => {

    //A flat array containing all the nodes and their relevant information
    //below moved to reducer
    //const [nodeIndex, setNodeIndex] = useState({});
    //const [reloading, setReloading] = useState(false);

    const [treeState, dispatch] = useReducer(treeSearchReducer, initialTreeState);

    let countNodesByKey = new Map();

    useEffect(() => {
        dispatch({type: 'reloading'});
        const initialTree = treeState.pristine && currentState && !_.isEmpty(currentState) ? currentState : treeState.nodeIndex;
        try {
            refreshTree(initialTree).then((nodeIndex) => {
                //TODO: shouldSkipFetch used in newNavigator, when switching betweeen tabs, is this the best approach?
                const shouldSkipFetch = !_.isEmpty(initialTree);
                dispatch({type: 'reloaded',nodeIndex: nodeIndex});
                if(!shouldSkipFetch) {
                    onFetch(undefined, getFilteringNodes(nodeIndex), nodeIndex);
                }
            })
        } catch (e) {
            dispatch({type: 'reloaded'});
        }
    }, [treeLevels,reloadToken])


    useEffect(() => {
        if(_.isEmpty(currentValue)) {
            resetNodeIndex()
        }
    }, [currentValue])


    function resetNodeIndex() {
        let nodeIndex = {
            ...treeState.nodeIndex,
        }
        _.values(nodeIndex).forEach((node) => {
            nodeIndex[node.id] = {...node, selectedStatus: TreeNodeStatus.OFF};
        })
        dispatch({nodeIndex});
    }


    async function getTree() {
        const level = 0;
        const parentNames = undefined;
        const parents = undefined;

        const levelNodes = await getLevelNodes(level, parentNames);
        
        let newNodeIndex = await buildNodeIndex(levelNodes, level, parents, parentNames, currentValue);

        //Load expanded nodes' children
        for(const nodeKey of _.keys(newNodeIndex)) {
            newNodeIndex = await loadChildrenDeep(nodeKey, newNodeIndex, currentValue);
        }
        return newNodeIndex;
    };

    async function refreshTree(initialTree) {
        let newNodeIndex = _.isEmpty(initialTree) ? await getTree() : initialTree;
        return newNodeIndex;
    }

    const getPreviousValues = (parentNames) => {

        let keys = treeLevels.map(tl => tl.property);
        let values = parentNames.map(name => parseNodeName(name)?.displayName);


        return _.zipObject(keys, values)
    }

    const isLast = (level) => level === treeLevels.length-1;

    async function fetchChildren(nodeLevel, node, nodeParentNames) {
        const isLeaf = isLast(nodeLevel);

        if(isLeaf) {
            return []
        }

        return (await getLevelNodes(nodeLevel+1, [...nodeParentNames, node.name]))
    } 

    async function getChildrenNames(nodeLevel, node, nodeParentNames) {
        return (await fetchChildren(nodeLevel, node, nodeParentNames))
        .map(child => child.name)
    }

    

    const buildNodeIndex = async (levelNodes, level, parents = [], parentNames = [], currentValue) => {
        let newNodeIndexPromises = levelNodes.map( async node => {

            const nodeFromProps = _.values(currentValue).find(n => {
                if(!n.id){
                    //current value might come from a query which might be without an id
                    return n.name == node.name;
                }
                return n.id === node.id
            });

            const id = node.id;
            const name = node.name;
            const count = node.childCount;
            const isLeaf = isLast(level);
            const childrenNames = await getChildrenNames(level, node, parentNames);
            const children = [...childrenNames]
            const defaultSelectedStatus = _.get(
                treeState.nodeIndex,
                `${_.last(parents)}.selectedStatus`
            ) === TreeNodeStatus.ON ? TreeNodeStatus.ON : TreeNodeStatus.OFF


            const expanded = nodeFromProps?.expanded || false;
            const selectedStatus = nodeFromProps?.selectedStatus || defaultSelectedStatus;


            return {
                id,
                name,
                count,
                level,
                parents,
                parentNames,
                children,
                childrenNames,
                isLeaf,
                expanded,
                selectedStatus
            }
        })

        let newNodeIndex = {}

        const newNodeIndexArray = await Promise.all(newNodeIndexPromises);

        newNodeIndexArray.forEach(newNode => newNodeIndex[newNode.id] = newNode);

        return newNodeIndex;
    }

    async function getLevelNodes(level, parentNames = []) {

        let input = getPreviousValues(parentNames);

        const rawNodes = await ScriptHelper.executeScript(treeLevels[level].script,
            parentNames ? {input} : undefined)

        const levelNodes = rawNodes.map((node, position) => {


            const displayName = node.name ? node.name : node;
            const nameKey = stringifyNode({displayName: displayName, level, position});

            // create unique (but repeatable on each re-render) id for the node
            // to also allow it to work with query navigation
            let idSuffixPart = countNodesByKey.get(nameKey) || 0;
            let id = `${nameKey}-${++idSuffixPart}`;
            countNodesByKey.set(nameKey,idSuffixPart);

            // we cannot use random ids on each render due to navigation issues
            // we need to wait for a persistent ids
            //let id = uid();

            if(node.name) {
                return {...node, id: id, name: nameKey}
            } else {
                return {id: id, name: nameKey, childCount: 0}
            }
        });
        return levelNodes;
    } 

    async function loadChildren(nodeKey, nodeIndex, currentValue) {
        let nodeIndicesToAdd = await getChildren(nodeKey, nodeIndex, currentValue)
        let node = {...nodeIndex[nodeKey], children: _.keys(nodeIndicesToAdd)}
        let newNodeIndex = {...nodeIndex, ...nodeIndicesToAdd, [nodeKey]: node};

        return newNodeIndex;
    }

    async function getChildren(nodeKey, nodeIndex, currentValue) {
        const expandingNode = nodeIndex[nodeKey];
        const level = expandingNode.level+1;
        const parentNames = [...expandingNode.parentNames, expandingNode.name];
        const parents = [...expandingNode.parents, expandingNode.id];
        const levelNodes = await getLevelNodes(level, parentNames)
        let nodeIndicesToAdd = await buildNodeIndex(levelNodes, level, parents, parentNames, currentValue)
        return nodeIndicesToAdd;
    }

    async function getChildrenAndParent(nodeKey, nodeIndex, currentValue) {
        let nodeIndicesToAdd = await getChildren(nodeKey, nodeIndex, currentValue);
        let node = {...nodeIndex[nodeKey], children: _.keys(nodeIndicesToAdd)};
        return {...nodeIndicesToAdd, [nodeKey]: node};
    }

    //Loads all deeply nested children of node if they need to be displayed
    async function loadChildrenDeep(nodeKey, nodeIndex, currentValue) {
        let node = nodeIndex[nodeKey];
        
        if(!node || _.isEmpty(node.children) || node.isLeaf || !node.expanded) {
            return nodeIndex;
        } else {
            let newNodeIndex = await loadChildren(nodeKey, nodeIndex, currentValue);
            let updatedNode = nodeIndex[nodeKey];
            for (const child of updatedNode.children) {
                newNodeIndex = await loadChildrenDeep(child.name, newNodeIndex, currentValue);
            }
            return newNodeIndex;
        }
    }


    const propagateSelectStatusDown = (nodeIndex, nodeKey, selected) => {
        const selectedNode = nodeIndex[nodeKey];
        if(!selectedNode) {
            return []
        }

        selectedNode.selectedStatus = selected ? TreeNodeStatus.ON : TreeNodeStatus.OFF;
        let selectedNodeChildren = selectedNode.children.map(childName => propagateSelectStatusDown(nodeIndex, childName, selected))

        return [selectedNode, ..._.flatten(selectedNodeChildren)];
    }

    function getFilteringNodes(aNodeIndex) {
        return _.pickBy(aNodeIndex, node => [TreeNodeStatus.ON].includes(node.selectedStatus))
    }


    async function handleNodeIndexChange(nodeIndex) {

        const childrenPromises = _.values(nodeIndex).map((node) => {
            let childrenNotLoaded = _.isEqual(node.children, node.childrenNames);
            if (node.expanded && childrenNotLoaded) {
                return getChildrenAndParent(node.id, nodeIndex, currentValue)
            } else {
                return Promise.resolve({});
            }
        })

        let childrenToAdd = {}
        _.merge(childrenToAdd, ...(await Promise.all(childrenPromises)));

        const newNodeIndex = {...nodeIndex, ...childrenToAdd}

        let selectedNodes = getFilteringNodes(newNodeIndex);
        selectedNodes = !_.isEmpty(selectedNodes) ? selectedNodes : null;

        if (!_.isEqual(currentValue, selectedNodes)) {
            let selectedNodesWithNameAsKey = {}
            _.values(selectedNodes).forEach(node => selectedNodesWithNameAsKey[node.name] = node)
            //TODO: skipFetch if node not selected
            onFetch(undefined, selectedNodesWithNameAsKey, newNodeIndex);
        }
        dispatch({nodeIndex: newNodeIndex});
    }

    return <div className="tree-search">
        {display && <label className='title'>{display}</label>}
        {
            !treeState.reloading && !_.isEmpty(treeState.nodeIndex) ? <ReactiveTreeControl className="entity-tree"
                renderLeafNode={treeControlLeafNodeRenderer}
                renderBranchNode={treeControlBranchNodeRenderer}
                nodeIndex={treeState.nodeIndex}
                onNodeIndexChange={handleNodeIndexChange}
            /> : <p>Loading tree...</p>
        }
    </div>
    
    
    
};

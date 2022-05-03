import React, {useEffect, useState} from "react";
import FancyTreeControl from "./FancyTreeControl";
import {TreeSelectMode} from "../IpaPageComponents/entities/EntitySelectionPanel";
import ScriptHelper from "../IpaUtils/ScriptHelper";
import {produce} from "immer";
import _, { set } from "lodash";
import {uid} from 'uid';
import {TreeNodeStatus} from "../IpaUtils/TreeHelpers";
import {parseNodeName, parseNode, stringifyNode} from "./private/tree";
import ReactiveTreeControl from "./ReactiveTreeControl";

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

export const TreeSearch = ({ currentValue = {}, onFetch, treeLevels, reloadToken }) => {

    //A flat array containing all the nodes and their relevant information
    const [nodeIndex, setNodeIndex] = useState({});


    const [reloading, setReloading] = useState(false);

    useEffect(() => {
        refreshTree()
    }, [treeLevels])

    useEffect(() => {
        setReloading(true)
        refreshTree().then((nodeIndex) => {
            setReloading(false)
            onFetch(undefined, getFilteringNodes(nodeIndex))
        })

    }, [reloadToken])


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

    async function refreshTree() {
        let newNodeIndex = await getTree();
        setNodeIndex(newNodeIndex);
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

            const nodeFromProps = _.values(currentValue).find(n => n.id === node.id);

            const id = node.id;
            const name = node.name;
            const count = node.childCount;
            const isLeaf = isLast(level);
            const childrenNames = await getChildrenNames(level, node, parentNames);
            const children = [...childrenNames]
            const defaultSelectedStatus = _.get(
                nodeIndex, 
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

    

    const NODES = [
        {
            "name": "Curtain Walls",
            "childCount": 21
        },
        {
            "name": "Door - External",
            "childCount": 6
        },
        {
            "name": "Door - Internal",
            "childCount": 23
        },
        {
            "name": "Elevator",
            "childCount": 1
        },
        {
            "name": "Furniture",
            "childCount": 10
        },
        {
            "name": "Joinery - Cabinet",
            "childCount": 21
        },
        {
            "name": "Joinery - Feature",
            "childCount": 2
        },
        {
            "name": "Mechanical and Plumbing Equipment",
            "childCount": 2
        },
        {
            "name": "Window - External",
            "childCount": 67
        },
        {
            "name": "Window - Internal",
            "childCount": 3
        }
    ]

    async function getLevelNodes(level, parentNames = []) {

        let input = getPreviousValues(parentNames);

        const rawNodes = await ScriptHelper.executeScript(treeLevels[level].script,
            parentNames ? {input} : undefined)

        const levelNodes = rawNodes.map((node, position) => {
            
            if(node.name) {
                return {...node, id: uid(), name: stringifyNode({displayName: node.name, level, position})}
            } else {
                return {id: uid(), name: stringifyNode({displayName: node, level, position}), childCount: 0}
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
            let updatedNode = newState.nodeIndex[nodeKey];
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
            if(node.expanded && childrenNotLoaded) {
                return getChildrenAndParent(node.id, nodeIndex, currentValue)
            } else {
                return Promise.resolve({});
            }
        })
        
        let childrenToAdd = {}
        _.merge(childrenToAdd, ...(await Promise.all(childrenPromises)));

        const newNodeIndex = {...nodeIndex, ...childrenToAdd}
        
        let selectedNodes = getFilteringNodes(newNodeIndex)
        selectedNodes = !_.isEmpty(selectedNodes) ? selectedNodes : null;

        if(!_.isEqual(currentValue, selectedNodes)) {
            let selectedNodesWithNameAsKey = {}
            _.values(selectedNodes).forEach(node => selectedNodesWithNameAsKey[node.name] = node)
            onFetch(undefined, selectedNodesWithNameAsKey);
        }
        setNodeIndex(newNodeIndex)
    }

    return !reloading && !_.isEmpty(nodeIndex) ? <ReactiveTreeControl className="entity-tree"
             renderLeafNode={treeControlLeafNodeRenderer}
             renderBranchNode={treeControlBranchNodeRenderer}
             nodeIndex={nodeIndex}
             onNodeIndexChange={handleNodeIndexChange}
    /> : 'Loading tree...'
};

import React, {useEffect, useState} from "react";
import FancyTreeControl from "./FancyTreeControl";
import {TreeSelectMode} from "../IpaPageComponents/entities/EntitySelectionPanel";
import ScriptHelper from "../IpaUtils/ScriptHelper";
import {produce} from "immer";
import _, { set } from "lodash";
import {TreeNodeStatus} from "../IpaUtils/TreeHelpers";
import {parseName, parseNode, stringifyName} from "./private/tree";

const treeControlLeafNodeRenderer = (group) => <div>{parseName(group.name).displayName}{!!group.count && <span className="count" style={{fontSize: "0.8em"}}>{group.count}</span>}</div>;

const treeControlBranchNodeRenderer = (groupName, nodeValue) => {
    const childCount = _.isArray(nodeValue) ? nodeValue.reduce((a, b) => a + (b['count'] || 0), 0) : undefined;

    return (
        <span>            
            {parseName(groupName).displayName}
            {!!childCount && <span className="count" style={{fontSize: "0.8em"}}>{childCount}</span>}
          </span>
    )
};

export const TreeSearch = ({ currentValue = {}, onChange, touched, onFetch, display, additionalOptions, isFetching, treeLevels, reloadToken }) => {
    //The actual deeply nested tree object
    const [tree, setTree] = useState({})

    //A flat array containing all the nodes and their relevant information
    const [nodeIndex, setNodeIndex] = useState({});

    const initialFilteringNodeIndex = _.mapValues(currentValue,parseNode);

    const [reloading, setReloading] = useState(false);
    const [fetchedOnce, setFetchedOnce] = useState(false);

    useEffect(() => {
        refreshTree()
    }, [treeLevels])

    useEffect(() => {
        if(fetchedOnce) {

            setReloading(true)
            refreshTree().then(({nodeIndex}) => {
                setReloading(false)
                onFetch(getFilteringNodes(nodeIndex))
            })
        }

    }, [reloadToken])


    async function getTree() {
        const level = 0;
        const parents = undefined;

        const levelNodes = await getLevelNodes(level, parents);

        const firstLevelPromise = getTreeLeafGroup(levelNodes, level, parents);
        const newNodeIndexPromise = buildNodeIndex(levelNodes, level, parents, currentValue);
        let [firstLevel, newNodeIndex] = await Promise.all([firstLevelPromise, newNodeIndexPromise]);


        //Load expanded nodes' children
        let newState = {nodeIndex: newNodeIndex, tree: firstLevel};
        for(const nodeName of _.keys(newNodeIndex)) {
            newState = await loadChildrenDeep(nodeName, newState.nodeIndex, newState.tree, currentValue);
        }
        return newState;

        // return {nodeIndex: newNodeIndex, tree: firstLevel};
    };

    async function refreshTree() {
        let state = await getTree();
        // state.nodeIndex = selectAndExpandNodes(state.nodeIndex, selectedNodes)
        setTree(state.tree);
        setNodeIndex(state.nodeIndex);
        return state;
    }

    const getPreviousValues = (parents) =>_.zipObject(treeLevels.map(tl => tl.property), parents.map(name => parseName(name).displayName))

    const isLast = (level) => level + 1 === treeLevels.length;

    async function getChildrenKeys(nodeLevel, nodeName, nodeParents) {
        const isLeaf = isLast(nodeLevel);

        if(isLeaf) {
            return []
        }
       return (await getLevelNodes(nodeLevel+1, [...nodeParents, nodeName]))
        .map(child => child.name)
    } 

    const buildNodeIndex = async (levelNodes, level, parents = [], currentValue) => {
        let newNodeIndexPromises = levelNodes.map( async node => {
            const name = node.name;
            const isLeaf = isLast(level);
            const children = await getChildrenKeys(level, node.name, parents);
            const defaultSelectedStatus = _.get(
                nodeIndex, 
                `${_.last(parents)}.selectedStatus`
            ) === TreeNodeStatus.ON ? TreeNodeStatus.ON : TreeNodeStatus.OFF


            const expanded = currentValue?.[name]?.expanded || false;
            const selectedStatus = currentValue?.[name]?.selectedStatus || defaultSelectedStatus;


            return {
                name,
                level,
                parents,
                children,
                isLeaf,
                expanded,
                selectedStatus
            }
        })

        let newNodeIndex = {}

        const newNodeIndexArray = await Promise.all(newNodeIndexPromises)
        newNodeIndexArray.forEach(newNode => newNodeIndex[newNode.name] = newNode);

        return newNodeIndex;
    }


    //unselects all nodes by setting selectedStatus properties from all nodes in nodeIndex to OFF
    const clearNodeSelection = () => {
        const newNodeIndex = produce(nodeIndex, nodeIndex => {
            Object.keys(nodeIndex).forEach((key) => {
                nodeIndex[key].selectedStatus = TreeNodeStatus.OFF
            })
        });
        setNodeIndex(newNodeIndex);
    }

    async function getLevelNodes(level, parents = []) {
        const levelNodes = (await ScriptHelper.executeScript(treeLevels[level].script,
            parents ? {input: getPreviousValues(parents) } : undefined)
        ).map((node, i) => (node.name ?
                {...node, name: stringifyName(node.name, level, i) } : { name: stringifyName(node, level, i), childCount: 0}
        ));

        return levelNodes;
    } 

    async function getTreeLeafGroup(levelNodes, level, parents = []) {
        if(!levelNodes) {
            levelNodes = await getLevelNodes(level, parents);
        }
        return isLast(level) ?
            levelNodes.map((node) => ({name: node.name, isLeaf: true, level, parents, count: node.childCount})) :
            levelNodes.reduce((accum, node) =>
                ({
                    ...accum,
                    [node.name]: [{name: stringifyName("Loading...", "X", "X"), count: node.childCount}]
                }), {}
        );
    }

    async function loadChildren(nodeName, nodeIndex, tree, currentValue) {
        const expandingNode = nodeIndex[nodeName];
        const level = expandingNode.level + 1;
        const parents = [...expandingNode.parents, nodeName];
        const levelNodes = await getLevelNodes(level, parents)
        const leafGroup = await getTreeLeafGroup(
            levelNodes, 
            level, 
            parents
        );
        let nodeIndicesToAdd = await buildNodeIndex(levelNodes, level, parents, currentValue)
        let newNodeIndex = {...nodeIndex, ...nodeIndicesToAdd};
        let newTree = produce(tree, tree => {
            _.get(tree, expandingNode.parents.join('.'), tree)[nodeName] = leafGroup
        })

        return {nodeIndex: newNodeIndex, tree: newTree};
    }

    //Loads all deeply nested children of node if they need to be displayed
    async function loadChildrenDeep(nodeName, nodeIndex, tree, currentValue) {
        let node = nodeIndex[nodeName];
        
        if(!node || _.isEmpty(node.children) || node.isLeaf || !node.expanded) {
            return {nodeIndex, tree};
        } else {
            // newState: {tree, newIndex};
            let newState = await loadChildren(nodeName, nodeIndex, tree, currentValue);
            let updatedNode = newState.nodeIndex[nodeName];
            for (const child of updatedNode.children) {
                newState = await loadChildrenDeep(child.name, newState.nodeIndex, newState.tree, currentValue);
            }
            return newState;
        }


    }

    function expandNode(nodeIndex, nodeName, expanded) {
        let expandedNode = nodeIndex[nodeName]
        let newNode = {...expandedNode, expanded}
        let newNodeIndex = {...nodeIndex, [nodeName]: newNode};

        return newNodeIndex;
    }

    const handleExpand = async (nodeName, unexpandedNodeValues) => {
        let expandedNode = nodeIndex[nodeName]
        let newNodeIndex = expandNode(nodeIndex, nodeName, !expandedNode.expanded);

        const childrenNotLoaded = Array.isArray(unexpandedNodeValues) && !unexpandedNodeValues[0].isLeaf;
        if(childrenNotLoaded){
            let newState = await loadChildren(nodeName, newNodeIndex, tree, currentValue);
            newNodeIndex = newState.nodeIndex;
            setTree(newState.tree);
        } 
        setNodeIndex(newNodeIndex);
    }

    const propagateSelectStatusDown = (nodeIndex, nodeName, selected) => {
        const selectedNode = nodeIndex[nodeName];
        if(!selectedNode) {
            return []
        }
    
        selectedNode.selectedStatus = selected ? TreeNodeStatus.ON : TreeNodeStatus.OFF;
        let selectedNodeChildren = selectedNode.children.map(childName => propagateSelectStatusDown(nodeIndex, childName, selected))

        return [selectedNode, ..._.flatten(selectedNodeChildren)];
    }

    const propagateSelectStatusUp = (nodeIndex, nodeName) => {
        const selectedNode = nodeIndex[nodeName];
        if(!selectedNode) {
            return []
        }
        return selectedNode.parents.slice().reverse().map(parentName => recalculateSelectedStatus(nodeIndex, parentName))
    }

    const recalculateSelectedStatus = (nodeIndex, nodeName) => {
        const currentNode = {...nodeIndex[nodeName]};
        const children = currentNode.children.map(childName => nodeIndex[childName]);
        if(children.every(childNode => childNode.selectedStatus === TreeNodeStatus.ON)){
            currentNode.selectedStatus = TreeNodeStatus.ON
        } else if (children.every(childNode => childNode.selectedStatus === TreeNodeStatus.OFF)){
            currentNode.selectedStatus = TreeNodeStatus.OFF
        } else {
            currentNode.selectedStatus = TreeNodeStatus.PARTIAL
        }

        return currentNode;
    };

    function selectNode(nodeIndex, nodeName, selected) {

        let newNodeIndex = {...nodeIndex};

        let downNodes = propagateSelectStatusDown(nodeIndex, nodeName, selected);
        let upNodes = propagateSelectStatusUp(nodeIndex, nodeName);
        const allNodesToChange = [...downNodes, ...upNodes];


        allNodesToChange.forEach(node => {
            newNodeIndex[node.name].selectedStatus = node.selectedStatus;
        })

        return newNodeIndex;
    }


    const handleSelect = async (leaves, nodeName, nodeValue, isParent, selected) => {
        const newNodeIndex = selectNode(nodeIndex, nodeName, selected);
        setNodeIndex(newNodeIndex)
        onChange(getFilteringNodes(newNodeIndex))
        onFetch(getFilteringNodes(newNodeIndex))
        setFetchedOnce(true);
    };

    function getFilteringNodes(aNodeIndex) {
        return _.pickBy(aNodeIndex, node => [TreeNodeStatus.ON, TreeNodeStatus.PARTIAL].includes(node.selectedStatus))
    }

    const getSelectedNodeNames = () =>  _.keys(_.pickBy(nodeIndex, node => node.selectedStatus === TreeNodeStatus.ON))

    const getPartialNodeNames = () =>  _.keys(_.pickBy(nodeIndex, node => node.selectedStatus === TreeNodeStatus.PARTIAL))

    const getExpandedNodeNames = () =>  _.keys(_.pickBy(nodeIndex, node => node.expanded))


    return !reloading && !_.isEmpty(tree) ? <FancyTreeControl className="entity-tree"
             renderLeafNode={treeControlLeafNodeRenderer}
             renderBranchNode={treeControlBranchNodeRenderer}
             onSelect={handleSelect}
             selectedNodeNames={getSelectedNodeNames()}
             partialNodeNames={getPartialNodeNames()}
             expandedNodeNames={getExpandedNodeNames()}
             allSelected={false}
             treeSelectMode={TreeSelectMode.NONE_MEANS_NONE}
             tree={tree}
             onExpand={handleExpand}
    /> : 'Loading tree...'
};

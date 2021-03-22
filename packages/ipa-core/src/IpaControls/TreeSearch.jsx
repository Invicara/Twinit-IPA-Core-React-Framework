import React, {useEffect, useState} from "react";
import FancyTreeControl from "./FancyTreeControl";
import {TreeSelectMode} from "../IpaPageComponents/entities/EntitySelectionPanel";
import ScriptHelper from "../IpaUtils/ScriptHelper";
import {produce} from "immer";
import _ from "lodash";
import {TreeNodeStatus} from "../IpaUtils/TreeHelpers";

export const parseNode = node => ({
    ...node,
    expanded: JSON.parse(node.expanded),
    isLeaf: JSON.parse(node.isLeaf),
    level: JSON.parse(node.level)
})

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

export const stringifyName = (displayName, level, position) => `${level}-${position}-${displayName}`
export const parseName = name => {
    const [level, position, ...displayNameParts] = name.split("-");
    return {level, position, displayName: displayNameParts.join("-")}
}

export const TreeSearch = ({ currentValue: filteringNodeIndex = {}, onChange, touched, onFetch, display, additionalOptions, isFetching, treeLevels }) => {
    const [tree, setTree] = useState({})
    const [nodeIndex, setNodeIndex] = useState({})
    const [initialFilteringNodeIndex] = useState(_.mapValues(filteringNodeIndex,parseNode))

    useEffect(() => {
        const getTree = async () => {
            const firstLevel = await getTreeLeafGroup(0);
            setTree(firstLevel)
            const sortedNodes = _.values(filteringNodeIndex).slice().sort((a, b) => a.level - b.level);

        };
        getTree()
    }, [treeLevels])

    useEffect(() => {
        const sortedNodes = _.values(initialFilteringNodeIndex).slice().sort((a, b) => a.level - b.level);
        for(const node of sortedNodes){
            const nodeFromIndex = nodeIndex[node.name];
            if(!_.isEmpty(nodeFromIndex) && !nodeFromIndex.isLeaf && _.isEmpty(nodeFromIndex.children)){
                 loadChildren(nodeFromIndex.name)
            }
        }
    }, [nodeIndex]);

    useEffect(() => {
        if(filteringNodeIndex === null){
            clearNodeSelection();
        }else{
            onFetch()
        }
    }, [filteringNodeIndex]);

    const getInitialValue = () => _.fromPairs(treeLevels.map(tl => [tl.property, []]))

    const getPreviousValues = (parents) =>_.zipObject(treeLevels.map(tl => tl.property), parents.map(name => parseName(name).displayName))

    const isLast = (level) => level + 1 === treeLevels.length;

    const loadIntoNodeIndex = (levelNodes, level, parents) => {
        setNodeIndex(produce(nodeIndex => {
            levelNodes.forEach(node => nodeIndex[node.name] = {
                name: node.name,
                level: level,
                parents,
                children: [],
                isLeaf: isLast(level),
                expanded: !!getFilteringNodes(initialFilteringNodeIndex)[node.name] && !isLast(level),
                selectedStatus: _.get(getFilteringNodes(initialFilteringNodeIndex), `${node.name}.selectedStatus`,
                    _.get(nodeIndex, `${_.last(parents)}.selectedStatus`) === TreeNodeStatus.ON ?
                        TreeNodeStatus.ON : TreeNodeStatus.OFF)
            })
            if (!_.isEmpty(parents)) nodeIndex[_.last(parents)].children = levelNodes.map(n => n.name)
        }))
    }

    const clearNodeSelection = () => {
        const newNodeIndex = produce(nodeIndex, nodeIndex => {
            Object.keys(nodeIndex).forEach((key) => {
                nodeIndex[key].selectedStatus = TreeNodeStatus.OFF
            })
        });
        setNodeIndex(newNodeIndex);
    }

    async function getTreeLeafGroup(level, parents = []) {
        const levelNodes = (await ScriptHelper.executeScript(treeLevels[level].script,
                parents ? {input: getPreviousValues(parents) } : undefined)
        ).map((node, i) => (node.name ?
                {...node, name: stringifyName(node.name, level, i) } : { name: stringifyName(node, level, i), childCount: 0}
        ));
        loadIntoNodeIndex(levelNodes, level, parents);
        return isLast(level) ?
            levelNodes.map((node) => ({name: node.name, isLeaf: true, level, parents, count: node.childCount})) :
            levelNodes.reduce((accum, node) =>
                ({
                    ...accum,
                    [node.name]: [{name: stringifyName("Loading...", "X", "X"), count: node.childCount}]
                }), {}
        );
    }

    const loadChildren = async (nodeName) => {
        const expandingNode = nodeIndex[nodeName];
        const leafGroup = await getTreeLeafGroup(expandingNode.level + 1, [...expandingNode.parents, nodeName]);
        setTree(produce(tree => {
            _.get(tree, expandingNode.parents.join('.'), tree)[nodeName] = leafGroup
        }))
    }

    const handleExpand = (nodeName, unexpandedNodeValues) => {
        setNodeIndex(produce(nodeIndex => {nodeIndex[nodeName].expanded = true}))
        const childrenNotLoaded = Array.isArray(unexpandedNodeValues) && !unexpandedNodeValues[0].isLeaf;
        if(childrenNotLoaded){
            loadChildren(nodeName);
        }
    }

    const propagateSelectStatusDown = (nodeIndex, nodeName, selected) => {
        const selectedNode = nodeIndex[nodeName];
        selectedNode.selectedStatus = selected ? TreeNodeStatus.ON : TreeNodeStatus.OFF;
        selectedNode.children.forEach(childName => propagateSelectStatusDown(nodeIndex, childName, selected))
    }

    const propagateSelectStatusUp = (nodeIndex, nodeName) => {
        const selectedNode = nodeIndex[nodeName];
        selectedNode.parents.slice().reverse().forEach(parentName => recalculateSelectedStatus(nodeIndex, parentName))
    }

    const recalculateSelectedStatus = (nodeIndex, nodeName) => {
        const currentNode = nodeIndex[nodeName];
        const children = currentNode.children.map(childName => nodeIndex[childName]);
        if(children.every(childNode => childNode.selectedStatus === TreeNodeStatus.ON)){
            currentNode.selectedStatus = TreeNodeStatus.ON
        } else if (children.every(childNode => childNode.selectedStatus === TreeNodeStatus.OFF)){
            currentNode.selectedStatus = TreeNodeStatus.OFF
        } else {
            currentNode.selectedStatus = TreeNodeStatus.PARTIAL
        }
    };

    const handleSelect = async (leaves, nodeName, nodeValue, isParent, selected) => {
        const newNodeIndex = produce(nodeIndex, nodeIndex => {
            propagateSelectStatusDown(nodeIndex, nodeName, selected);
            propagateSelectStatusUp(nodeIndex, nodeName);
        });

        onChange(getFilteringNodes(newNodeIndex))
        setNodeIndex(newNodeIndex)
    };

    const getFilteringNodes = (aNodeIndex) =>
        _.pickBy(aNodeIndex, node => [TreeNodeStatus.ON, TreeNodeStatus.PARTIAL].includes(node.selectedStatus))

    const getSelectedNodeNames = () =>  _.keys(_.pickBy(nodeIndex, node => node.selectedStatus === TreeNodeStatus.ON))

    const getPartialNodeNames = () =>  _.keys(_.pickBy(nodeIndex, node => node.selectedStatus === TreeNodeStatus.PARTIAL))

    const getExpandedNodeNames = () =>  _.keys(_.pickBy(nodeIndex, node => node.expanded))

    return !_.isEmpty(tree) ? <FancyTreeControl className="entity-tree"
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

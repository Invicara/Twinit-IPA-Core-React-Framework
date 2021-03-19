import React from "react";

export const TreeNodeStatus = {
    ON: 'on',
    PARTIAL: 'partial',
    OFF: 'off'
}

export const defaultLeafRenderer = ({nodeValue}, toggleCurrentNode) =>
    nodeValue && <div>{nodeValue["Entity Name"]}
        { nodeValue["EntityWarningMessage"] &&
        <div className="tooltip-wrapper">
            <div className="dbm-tooltip">
                <i className="fas fa-exclamation-circle"/>
                <span className="dbm-tooltiptext">{nodeValue["EntityWarningMessage"]}</span>
            </div>
        </div>}
    </div>;

export const defaultBranchRenderer = ({nodeValue}, childrenCount, toggleCurrentNode) => {
    return (
        <span>
        {nodeValue}<span className="count" style={{fontSize: "0.8em"}}>{childrenCount}</span>
      </span>
    )
};

export const withoutPropagation = (whatToDo) => e => {
    e.stopPropagation();
    whatToDo()
}

export const propagateNodeStatusDown = (property) => (nodeIndex, nodeId, newNodeStatus) => {
    const selectedNode = nodeIndex[nodeId];
    selectedNode[property] = newNodeStatus;
    selectedNode.children.forEach(childName => propagateNodeStatusDown(property)(nodeIndex, childName, newNodeStatus))
}

export const propagateNodeStatusUp = (property) => (nodeIndex, nodeId) => {
    const selectedNode = nodeIndex[nodeId];
    selectedNode.parents.slice().reverse().forEach(parentName => recalculateNodeStatus(property)(nodeIndex, parentName))
}

export const recalculateNodeStatus = (property) => (nodeIndex, nodeId) => {
    const currentNode = nodeIndex[nodeId];
    const children = currentNode.children.map(childName => nodeIndex[childName]);
    if(children.every(childNode => childNode[property] === TreeNodeStatus.ON)){
        currentNode[property] = TreeNodeStatus.ON
    } else if (children.every(childNode => childNode[property] === TreeNodeStatus.OFF)){
        currentNode[property] = TreeNodeStatus.OFF
    } else {
        currentNode[property] = TreeNodeStatus.PARTIAL
    }
};


const TreeHelpers = {
    defaultLeafRenderer,
    defaultBranchRenderer,
    withoutPropagation,
    propagateNodeStatusDown,
    propagateNodeStatusUp,
    recalculateNodeStatus,
}

export default TreeHelpers
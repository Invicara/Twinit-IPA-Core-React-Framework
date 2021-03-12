import React from "react";
import {SelectedStatus} from "../TreeSearch";

export const defaultLeafRenderer = ({nodeValue}) =>
    nodeValue && <div>{nodeValue["Entity Name"]}
      { nodeValue["EntityWarningMessage"] &&
      <div className="tooltip-wrapper">
        <div className="dbm-tooltip">
          <i className="fas fa-exclamation-circle"/>
          <span className="dbm-tooltiptext">{nodeValue["EntityWarningMessage"]}</span>
        </div>
      </div>}
    </div>;

export const defaultBranchRenderer = ({nodeValue}, childrenCount) => {
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

export const propagateSelectStatusDown = (nodeIndex, nodeId, newSelectedStatus) => {
    const selectedNode = nodeIndex[nodeId];
    selectedNode.selectedStatus = newSelectedStatus;
    selectedNode.children.forEach(childName => propagateSelectStatusDown(nodeIndex, childName, newSelectedStatus))
}

export const propagateSelectStatusUp = (nodeIndex, nodeId) => {
    const selectedNode = nodeIndex[nodeId];
    selectedNode.parents.slice().reverse().forEach(parentName => recalculateSelectedStatus(nodeIndex, parentName))
}

export const recalculateSelectedStatus = (nodeIndex, nodeId) => {
    const currentNode = nodeIndex[nodeId];
    const children = currentNode.children.map(childName => nodeIndex[childName]);
    if(children.every(childNode => childNode.selectedStatus === SelectedStatus.SELECTED)){
        currentNode.selectedStatus = SelectedStatus.SELECTED
    } else if (children.every(childNode => childNode.selectedStatus === SelectedStatus.CLEAR)){
        currentNode.selectedStatus = SelectedStatus.CLEAR
    } else {
        currentNode.selectedStatus = SelectedStatus.PARTIAL
    }
};
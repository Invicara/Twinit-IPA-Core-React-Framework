import React from "react";
import _ from 'lodash'
import clsx from "clsx";
import {SelectedStatus} from "../TreeSearch";
import {produce} from "immer";
import {
  defaultBranchRenderer,
  defaultLeafRenderer,
  propagateSelectStatusDown, propagateSelectStatusUp,
  withoutPropagation
} from "./tree-helpers";

const ReactiveTreeControl = ({nodeIndex, onNodeIndexChange, renderBranchNode = defaultBranchRenderer, renderLeafNode = defaultLeafRenderer}) => {

  const getNodeClasses = (node, baseClasses = '') => clsx(baseClasses,
        _.get(node,'selectedStatus', SelectedStatus.CLEAR) === SelectedStatus.SELECTED && "selected",
        _.get(node,'selectedStatus', SelectedStatus.CLEAR) === SelectedStatus.PARTIAL && "partial",
        _.get(node,'expanded', false) && "expanded",
  )

  const expandBranch = (node) => onNodeIndexChange(produce(nodeIndex, nodeIndex => {
    nodeIndex[node.id].expanded = !nodeIndex[node.id].expanded
  }))

  const selectNode = (node) => onNodeIndexChange(produce(nodeIndex, nodeIndex => {
    const wasSelected = nodeIndex[node.id].selectedStatus === SelectedStatus.SELECTED
    propagateSelectStatusDown(nodeIndex, node.id, wasSelected ?  SelectedStatus.CLEAR : SelectedStatus.SELECTED);
    propagateSelectStatusUp(nodeIndex, node.id);
  }))

  const getNodeChildren = (node) => node.children.map(childId => nodeIndex[childId]);

  const getChildrenCount = (node) => _.values(nodeIndex).filter(n => n.isLeaf && n.parents.includes(node.id)).length

  const renderBranch = (node) =>
        <li className={getNodeClasses(node, 'branch')} onClick={withoutPropagation(() => selectNode(node))} key={node.id}>
          <a>
            <span>
              <i className="fa fa-angle-down branch-expander" onClick={withoutPropagation(() => expandBranch(node))}/>
              {renderBranchNode(node, getChildrenCount(node))}
            </span>
          </a>
          <ul key={node.id + "_children"}>{renderNodes(getNodeChildren(node))}</ul>
        </li>

  const renderLeaf = (node) =>
      <li className={getNodeClasses(node, 'leaf')} key={node.id} onClick={withoutPropagation(() => selectNode(node))} >
        <a>
          <span>{renderLeafNode(node)}</span>
        </a>
      </li>


  const renderNodes = (treeNodes) => treeNodes.map(node =>
      node.isLeaf ? renderLeaf(node) : renderBranch(node)
  )

  return (
    <div className={"fancy-tree"}>
      <ul>
        {!_.isEmpty(nodeIndex) ? renderNodes(_.values(nodeIndex).filter(node => node.level === 1)) : null}
      </ul>
    </div>
  )
}

export default ReactiveTreeControl

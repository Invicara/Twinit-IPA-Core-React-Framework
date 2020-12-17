import React from "react";

import {getRandomString} from "../IpaUtils/helpers"

const TreeControl = ({tree, renderBranchNode, renderLeafNode, renderLeaves, selectedNodes}) => {

  if (!tree) return null

  const toggle = (e, branch) => {
    let el = document.querySelector("."+branch)
    Array.from(el.children).forEach(e => e.classList.toggle("expanded"))
    e.stopPropagation()
  }

  const getNodes = (nodes, depth, selected) => {
    if (!nodes) return
    let children
    if (Array.isArray(nodes)) {
      if (renderLeaves) children = renderLeaves(nodes)
      else {
        children = nodes.map((n) => {
          return <li key={n._id} className={depth <= 2 ? "expanded" : ""}>
            <a className={selected || selectedNodes.includes(n._id) ?"selected" : ""}>{renderLeafNode(n)}</a>
          </li>})
      }
    }
    else {
      children = []
      depth++
      Object.entries(nodes).forEach(([nodeName, nodeValue]) => {
        let branchClassName = getRandomString("branch_")

        let isSelected = selected || selectedNodes.includes(nodeName)

        children.push(
          <li key={nodeName} className={depth <= 3 ? "expanded" : ""}>
            <a onClick={(e)=>toggle(e, branchClassName)} className={isSelected ? "selected" : ""}>&gt;&nbsp;{
                renderBranchNode ? renderBranchNode(nodeName, nodeValue) : nodeName}</a>
              <ul className={branchClassName} key={nodeName+"_children"}>{getNodes(nodeValue, depth, isSelected)}</ul>
          </li>)
      })
    }
    return children
  }


  return (
    <ul className="tree">
      {getNodes(tree, 1)}
    </ul>
  )
}

export default TreeControl

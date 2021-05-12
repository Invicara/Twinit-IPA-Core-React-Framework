import React, {useEffect} from "react";

import {TreeSelectMode} from "../IpaPageComponents/entities/EntitySelectionPanel";
import _ from 'lodash'
import clsx from "clsx";

import './TreeControl.scss'

/**
 * @Deprecated, use {@link ./ReactiveTreeControl} instead
 */
//FIXME 1)This component shouldn't be mutating dom nodes manually. It is dangerous (in a React app) and hard to reason about
const FancyTreeControl = ({
                            name, tree, renderBranchNode, renderLeafNode, onSelect, selectedIds = [], singleSelect=false,
                            allSelected, treeSelectMode, onGroupSelect, selectedGroups, onExpand = _.noop,
                            //TODO Refactor these to just pass down node index
                            selectedNodeNames = [], expandedNodeNames = [], partialNodeNames = []
}) => {

  useEffect(() => {// If all items are selected, ensure the tree displays accordingly. This effect should no longer be necessary nor correct once FIXME number 1) is addressed
    if(allSelected){
      if(treeSelectMode === TreeSelectMode.NONE_MEANS_ALL){//And all means none so we deselect everything
        const selectedNodes = treeDOM.querySelectorAll("li.selected")
        Array.from(selectedNodes).forEach(s =>
            s.classList.remove("selected")
        )
      } else if(treeSelectMode === TreeSelectMode.NONE_MEANS_NONE){//And all means all so we select everything
        const deselectedNodes = treeDOM.querySelectorAll("li:not(.selected)")
        Array.from(deselectedNodes).forEach(s =>
            s.classList.add("selected")
        )
      }
    }
  }, [allSelected, treeSelectMode])

  useEffect(() => {// If there are no selected items, ensure the tree displays accordingly. This effect should no longer be necessary nor correct once FIXME number 1) is addressed
    if(_.isEmpty(selectedIds) && _.isEmpty(selectedNodeNames)){
      const allSelected = treeDOM.querySelectorAll("li.selected")
      Array.from(allSelected).forEach(s =>
          s.classList.remove("selected")
      )
    }
  }, [selectedIds]);

  if (!tree) return null
  let treeDOM

  const expandBranch = (e, nodeName, nodeValue) => {
    let el = e.target
    e.stopPropagation()
    while (el.tagName != "LI")
      el = el.parentElement
    el.classList.toggle("expanded"),
    onExpand(nodeName, nodeValue)
  }

  const selectNode = (e, nodeName, nodeValue) => {
    let el = e.target
    if (el.classList.contains("branch-expander")) {
      return
    }
    while (el.tagName != "LI")
      el = el.parentElement
    e.stopPropagation()

    el.classList.toggle("selected")

    if (el.classList.contains("branch")) {
      let branchLeaves = Array.from(el.querySelectorAll("li"))
      if (el.classList.contains("selected")) branchLeaves.forEach(ell => ell.classList.add("selected"))
      else branchLeaves.forEach(ell => ell.classList.remove("selected"))
    }

    let allBranches = treeDOM.querySelectorAll("li.branch")
    Array.from(allBranches).forEach(br => {
      let branchLeaves = br.querySelectorAll("li.leaf")
      let branchSelectedLeaves = br.querySelectorAll("li.leaf.selected")
      if (branchSelectedLeaves.length==0) {
        br.classList.remove("selected")
        br.classList.remove("partial")
      }
      else if (branchLeaves.length == branchSelectedLeaves.length) {
        br.classList.remove("partial")
        br.classList.add("selected")
      }
      else if (branchLeaves.length > branchSelectedLeaves.length) {
        br.classList.remove("selected")
        br.classList.add("partial")
      }
    })

    if (onSelect) {
      onSelect([...treeDOM.querySelectorAll("li.leaf.selected")], nodeName, nodeValue, _.isArray(nodeValue), el.classList.contains("selected"))
    }
  }

  const getNodes = (nodes, depth) => {
    if (!nodes) return
    let children
    if (Array.isArray(nodes)) {
      children = nodes.map((n) => {
        let cn = "leaf"
        if ((tree.length != selectedIds.length && selectedIds.includes(n._id)) || selectedNodeNames.includes(n.name)) cn += " selected";
        if (expandedNodeNames.includes(n.name)) cn += " expanded"
        if (partialNodeNames.includes(n.name)) cn += " partial"
        return (
          <li onClick={e => selectNode(e, n.name, n)} key={n._id} data-node-id={n._id} className={cn}>
            <a>
              <span>{renderLeafNode(n)}</span>
            </a>
          </li>)})
    }
    else {
      children = []
      depth++
      Object.entries(nodes).forEach(([nodeName, nodeValue]) => {
        children.push(
          <li className={clsx(
              'branch',selectedNodeNames.includes(nodeName) && "selected",
              expandedNodeNames.includes(nodeName) && "expanded", partialNodeNames.includes(nodeName) && "partial"
          )}
              onClick={e => selectNode(e, nodeName, nodeValue)} key={nodeName} data-branch-name={nodeName} >
            <a>
              <span>
                <i className="fa fa-angle-down branch-expander" onClick={e => expandBranch(e, nodeName, nodeValue)} />
                {renderBranchNode ? renderBranchNode(nodeName, nodeValue) : nodeName}
              </span>
            </a>
            <ul key={nodeName+"_children"}>{getNodes(nodeValue, depth)}</ul>
          </li>)
      })
    }
    return children
  }

  return (
    <div className={"fancy-tree"} ref={el=>treeDOM=el}>
      <ul>
        {getNodes(tree, 1)}
      </ul>
    </div>
  )
}

export default FancyTreeControl

import React, {useEffect,useCallback,useReducer,useRef} from "react";

import {TreeSelectMode} from "../IpaPageComponents/entities/EntitySelectionPanel";
import _ from 'lodash'
import clsx from "clsx";

import './TreeControl.scss';
import { AutoSizer, List, CellMeasurer, CellMeasurerCache } from "react-virtualized"


const fancyTreeControlSelectAllReducer = (state, action) => {
  switch (action.type) {
    case 'select_all':
      return {...state, selectAllActivated: true, previouslySelectedIds: action.previouslySelectedIds || []};
    default:
      return {...state, selectAllActivated: false, previouslySelectedIds: action.previouslySelectedIds || []};
  }
}

const initialSelectAllState = {selectAllActivated: false, previouslySelectedIds: []};

/**
 * @Deprecated, use {@link ./ReactiveTreeControl} instead
 */
//FIXME 1)This component shouldn't be mutating dom nodes manually. It is dangerous (in a React app) and hard to reason about
const FancyTreeControl = ({
                            name, tree, renderBranchNode, renderLeafNode, onSelect, selectedIds = [], onSelectAll, onSelectNone, onSelectIds, singleSelect=false,
                            allSelected, treeSelectMode, onGroupSelect, selectedGroups, onExpand = _.noop,
                            //TODO Refactor these to just pass down node index
                            selectedNodeNames = [], expandedNodeNames = [], partialNodeNames = []
}) => {

  const [selectAllState, dispatch] = useReducer(fancyTreeControlSelectAllReducer, initialSelectAllState);

  const treeDOMRef = useRef();
  const reactVirtualizedCache = useRef(new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 100
  }))

  const onSelectAllAction = useCallback(()=>{
    dispatch({type: 'select_all', previouslySelectedIds : selectedIds});//set selectAllState before onSelectAll
    if(onSelectAll){
      onSelectAll();
    }
  },[onSelectAll,selectedIds]);

  const onUndoSelectAllAction = useCallback(()=>{
    if(onSelectIds){
      onSelectIds(selectAllState.previouslySelectedIds);
    }
    dispatch({type: 'undo'});//clear selectAllState after onSelect
  },[onSelectIds,selectAllState]);

  const onSelectNoneAction = useCallback(()=>{
    if(onSelectNone){
      onSelectNone([]);
    }
  },[onSelectNone]);

  useEffect(() => {// If all items are selected, ensure the tree displays accordingly. This effect should no longer be necessary nor correct once FIXME number 1) is addressed
    const treeDOM = treeDOMRef.current;
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
    const treeDOM = treeDOMRef.current;
    if(_.isEmpty(selectedIds) && _.isEmpty(selectedNodeNames)){
      const allSelected = treeDOM.querySelectorAll("li.selected")
      Array.from(allSelected).forEach(s =>
          s.classList.remove("selected")
      )
    }
  }, [selectedIds]);

  useEffect(() => {
    establishTreeBranchClasses();
  }, [selectedIds,selectedGroups]);


  if (!tree) return null

  const expandBranch = (e, nodeName, nodeValue) => {
    let el = e.target

    e.stopPropagation()
    while (el.tagName != "LI")
      el = el.parentElement
    el.classList.toggle("expanded"),
    onExpand(nodeName, nodeValue)
  }

  const establishTreeBranchClasses = () => {
    const treeDOM = treeDOMRef.current;
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
    });
  }

  const selectNode = (e, nodeName, nodeValue) => {
    e.stopPropagation()

    let el = e.target
    if (el.classList.contains("branch-expander")) return
    while (el.tagName !== "LI") el = el.parentElement

    const nodeId = el.dataset.nodeId
    const isSelected = el.classList.contains("selected")

    let updatedSelectedIds = [...selectedIds]

    if (nodeId) {
      // leaf node
      if (isSelected) {
        updatedSelectedIds = updatedSelectedIds.filter(id => id !== nodeId)
      } else {
        updatedSelectedIds.push(nodeId)
      }
    } else if (el.classList.contains("branch")) {
      // branch node
      const leafNodes = Array.from(el.querySelectorAll("li.leaf"))
      const leafNodeIds = leafNodes.map(li => li.dataset.nodeId)
      const adding = !isSelected

      updatedSelectedIds = adding
        ? _.uniq([...updatedSelectedIds, ...leafNodeIds])
        : updatedSelectedIds.filter(id => !leafNodeIds.includes(id))
    } 

    establishTreeBranchClasses()
    onSelect?.(updatedSelectedIds, nodeName, nodeValue, _.isArray(nodeValue), !isSelected)

    dispatch({ type: 'nodeSelected', previouslySelectedIds: selectedIds })
  }

  const getNodes = (nodes, depth) => {
    if (!nodes) return
    let children
    if (Array.isArray(nodes)) {
      children = nodes.map((n) => {
        let cn = "leaf"
        if (selectedIds.includes(n._id) || selectedNodeNames.includes(n.name)) cn += " selected";
        if (expandedNodeNames.includes(n.name)) cn += " expanded"
        if (partialNodeNames.includes(n.name)) cn += " partial"
        return (
          <li onClick={e => selectNode(e, n.name, n)} key={n._id || n.name} data-node-id={n._id} className={cn}>
            <a>
              <span>{renderLeafNode(n)}</span>
            </a>
          </li>)
      })
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
            <ul style={{ height: nodeValue.length > 50 ? "60vh" : "auto", overflow: nodeValue.length > 50 ? "auto": "none" }} key={nodeName+"_children"}>{getNodes(nodeValue, depth)}</ul>
          </li>)
      })
    }
    return children
  }

  const flattenTree = (nodes, expandedNodeNames, depth = 0, result = []) => {
    if (Array.isArray(nodes)) {
      nodes.forEach(n => {
        result.push({ node: n, type: 'leaf', depth })
      })
    } else {
      Object.entries(nodes).forEach(([name, children]) => {
        result.push({ node: { name, children }, type: 'branch', depth })
        if (expandedNodeNames.includes(name)) {
          flattenTree(children, expandedNodeNames, depth + 1, result)
        }
      })
    }
    return result
  }

const flatTree = flattenTree(tree, expandedNodeNames);

  return (
    <div className={"fancy-tree"} ref={treeDOMRef}>
      {onSelectAll ? <div className="fancy-tree__count">
        <span>{`Refined: ${selectedIds.length}`}</span>
        {!allSelected ? <span className="fancy-tree__count--action" onClick={onSelectAllAction}>Select All</span> : (onSelectNoneAction ? <span className="fancy-tree__count--action" onClick={onSelectNoneAction}>Deselect All</span> : undefined) }
        {selectAllState.selectAllActivated && selectAllState.previouslySelectedIds.length>0 ? <span className="fancy-tree__count--action" onClick={onUndoSelectAllAction}>Undo</span> : undefined }
      </div> : undefined}
      <ul style={{ height: tree?.length > 50 ? "60vh" : "auto", width: "auto" }}>
        {Array.isArray(tree) && tree.length > 50 ?
          <AutoSizer>
            {({ width, height }) => (
              <List
                width={width}
                height={height}
                rowHeight={reactVirtualizedCache.current.rowHeight}
                deferredMeasurementCache={reactVirtualizedCache.current}
                rowRenderer={({ index, key, style, parent }) => {
                  const { node, type, depth } = flatTree[index]

                  return (
                    <CellMeasurer
                      key={key}
                      cache={reactVirtualizedCache.current}
                      parent={parent}
                      columnIndex={0}
                      rowIndex={index}
                    >
                      {({ registerChild }) => (
                        <div ref={registerChild} style={style}>
                          {type === 'leaf' ? (
                            <li
                              onClick={e => selectNode(e, node.name, node)}
                              key={node._id || node.name}
                              data-node-id={node._id}
                              className={`leaf ${selectedIds.includes(node._id) ? "selected" : ""}`}
                              style={{ paddingLeft: depth * 20 }}
                            >
                              <a><span>{renderLeafNode(node)}</span></a>
                            </li>
                          ) : (
                            <li
                              onClick={e => selectNode(e, node.name, node.children)}
                              key={node.name}
                              data-branch-name={node.name}
                              className={`branch ${expandedNodeNames.includes(node.name) ? "expanded" : ""}`}
                              style={{ paddingLeft: depth * 20 }}
                            >
                              <a>
                                <span>
                                  <i
                                    className="fa fa-angle-down branch-expander"
                                    onClick={e => expandBranch(e, node.name, node.children)}
                                  />
                                  {renderBranchNode(node.name, node.children)}
                                </span>
                              </a>
                            </li>
                          )}
                        </div>
                      )}
                    </CellMeasurer>
                  )
                }}
                rowCount={flatTree.length}
              />
            )}
          </AutoSizer> : getNodes(tree, 1)
        }
      </ul>
    </div>
  )
}

export default FancyTreeControl

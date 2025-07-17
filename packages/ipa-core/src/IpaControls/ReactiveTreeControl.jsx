import React, {useEffect, useRef, useCallback} from "react";
import _ from 'lodash'
import clsx from "clsx";
import {produce} from "immer";
import {
    defaultBranchRenderer,
    defaultLeafRenderer,
    propagateNodeStatusDown, propagateNodeStatusUp, TreeNodeStatus,
    withoutPropagation
} from "../IpaUtils/TreeHelpers";
import {curriedFlip} from "../IpaUtils/function";
import './TreeControl.scss';
import { AutoSizer, List, CellMeasurer, CellMeasurerCache } from "react-virtualized"

const MAX_HEIGHT_SCROLL = 50

const ReactiveTreeControl = ({nodeIndex, onNodeIndexChange, renderBranchNode = defaultBranchRenderer, renderLeafNode = defaultLeafRenderer, nodeHeight = 30}) => {

    const reactVirtualizedCache = useRef(new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: nodeHeight
      }))

    const listRef = useRef()

    const refreshList = useCallback(_.debounce(() => {
        listRef?.current?.recomputeRowHeights()
        listRef?.current?.forceUpdateGrid()
    }, 100), [listRef.current])

    useEffect(() => {
        const resize = () => {
            refreshList()
        }
        window.addEventListener('resize', resize)
        return () => {
            window.removeEventListener('resize', resize)
        };
    }, []);

    const getNodeClasses = (node, baseClasses = '') => {
        return clsx(baseClasses,
        _.get(node,'selectedStatus', TreeNodeStatus.OFF) === TreeNodeStatus.ON && "selected",
        _.get(node,'selectedStatus', TreeNodeStatus.OFF) === TreeNodeStatus.PARTIAL && "partial",
        _.get(node,'expanded', false) && "expanded",
        _.get(node,'hidden', false) && "hidden",
    )}

    const expandBranch = (node) => onNodeIndexChange(produce(nodeIndex, nodeIndex => {
        nodeIndex[node.id].expanded = !nodeIndex[node.id].expanded
    }))

    const toggleNode = (property) =>  (node) => onNodeIndexChange(produce(nodeIndex, nodeIndex => {
        const wasOn = nodeIndex[node.id][property] === TreeNodeStatus.ON
        propagateNodeStatusDown(property)(nodeIndex, node.id, wasOn ?  TreeNodeStatus.OFF : TreeNodeStatus.ON);
        propagateNodeStatusUp(property)(nodeIndex, node.id);
    }))

    const getNodeChildren = (node) => node?.children?.map(childId => nodeIndex[childId]);

    const getChildrenCount = (node) => _.values(nodeIndex).filter(n => n.isLeaf && n.parents.includes(node.id)).length

    const renderBranch = (node) => {
        const nodeRes = getNodeChildren(node)
        const isLeaf = nodeRes[0]?.isLeaf

        return (<li className={getNodeClasses(node, 'branch')} onClick={withoutPropagation(() => toggleNode('selectedStatus')(node))} key={node.id}>
                    <a>
                        <span>
                            <i className="fa fa-angle-down branch-expander" onClick={withoutPropagation(() => expandBranch(node))}/>
                                {renderBranchNode(node, getChildrenCount(node), curriedFlip(toggleNode)(node))}
                        </span>
                    </a>
                    {isLeaf? 
                        <ul key={node.id + "_children"} style={{ maxHeight: `${MAX_HEIGHT_SCROLL}vh`, overflowY: "auto" }} >
                         <AutoSizer disableHeight>
                             {({ width }) => (
                                 <List
                                     ref={listRef}
                                     width={width}
                                     height={Math.min(
                                        reactVirtualizedCache.current.rowHeight({ index: 0 }) *
                                            getNodeChildren(node).length,
                                        MAX_HEIGHT_SCROLL * window.innerHeight / 100 
                                     )}
                                     rowHeight={reactVirtualizedCache.current.rowHeight}
                                     deferredMeasurementCache={reactVirtualizedCache.current}
                                     rowRenderer={(virtualizedEvent) => {
                                         const children = getNodeChildren(node)
                                         const childNode = children[virtualizedEvent.index]
                                         return (
                                            <CellMeasurer key={virtualizedEvent.key} cache={reactVirtualizedCache.current} parent={virtualizedEvent.parent} columnIndex={0} rowIndex={virtualizedEvent.index}>                                                
                                                {renderNode(childNode, virtualizedEvent)}                                          
                                            </CellMeasurer>
                                         )
                                     }}
                                     rowCount={getNodeChildren(node).length}
                                 />
                             )}
                         </AutoSizer>
                     </ul> :
                    <ul key={node.id + "_children"}>{renderNodes(getNodeChildren(node))}</ul>   
                }

                </li>
            )
    }

    const renderNode = (node, virtualizedEvent) => {
        return node.isLeaf ? renderLeaf(node, virtualizedEvent) : renderBranch(node)
    }   
       

    const renderLeaf = (node, virtualizedEvent) =>
        <li style={virtualizedEvent?.style || {}} className={getNodeClasses(node, 'leaf')} key={node.id} onClick={withoutPropagation(() => toggleNode('selectedStatus')(node))} >
            <a>
                <span>{renderLeafNode(node, curriedFlip(toggleNode)(node))}</span>
            </a>
        </li>


    const renderNodes = (treeNodes) => treeNodes.map(node => {

        if(!node) {
            return <p>No node to render</p>
        }

        return node.isLeaf ? renderLeaf(node) : renderBranch(node)
    })

    return (
        <div className={"fancy-tree"}>
            {!_.isEmpty(nodeIndex) ? <ul>{renderNodes(_.values(nodeIndex).filter(node => node.level === 0))}</ul> : null}
        </div>
    )
}

export default ReactiveTreeControl

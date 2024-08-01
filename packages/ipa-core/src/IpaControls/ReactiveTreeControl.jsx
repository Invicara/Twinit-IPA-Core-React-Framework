import React, {useCallback, useEffect, useRef, useState} from "react";
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
import { CircularProgress } from "@material-ui/core";

const MAX_HEIGHT_SCROLL = 50

const ReactiveTreeControl = ({nodeIndex, onNodeIndexChange, renderBranchNode = defaultBranchRenderer, renderLeafNode = defaultLeafRenderer, nodeHeight = 30}) => {
    const [nodeLoading, setNodeLoading] = useState()

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

    const expandBranch = async (node) => {
        setNodeLoading(node.id)
        await onNodeIndexChange(produce(nodeIndex, nodeIndex => {
            nodeIndex[node.id].expanded = !nodeIndex[node.id].expanded
        }))

        listRef?.current?.recomputeRowHeights()
        listRef?.current?.forceUpdateGrid()
        setNodeLoading(null)
    }

    const toggleNode = (property) =>  (node) => onNodeIndexChange(produce(nodeIndex, nodeIndex => {
        const wasOn = nodeIndex[node.id][property] === TreeNodeStatus.ON
        propagateNodeStatusDown(property)(nodeIndex, node.id, wasOn ?  TreeNodeStatus.OFF : TreeNodeStatus.ON);
        propagateNodeStatusUp(property)(nodeIndex, node.id);
    }))

    const getNodeChildren = (node) => node?.children?.map(childId => nodeIndex[childId]);

    const getChildrenCount = (node) => _.values(nodeIndex).filter(n => n.isLeaf && n.parents.includes(node.id)).length

    const renderBranch = (node, virtualizedEvent) =>
        <li style={virtualizedEvent?.style || {}} className={getNodeClasses(node, 'branch')} onClick={withoutPropagation(() => toggleNode('selectedStatus')(node))} key={node.id}>
            <a>
                <span>
                    {node.id == nodeLoading
                        ? (
                            <CircularProgress style={{width: 12, height: 12, marginRight: 8}} />
                        ) : (
                            <i className="fa fa-angle-down branch-expander" onClick={withoutPropagation(() => expandBranch(node))}/>
                        )
                    }
                    {renderBranchNode(node, getChildrenCount(node), curriedFlip(toggleNode)(node))}
                </span>
            </a>
            <ul key={node.id + "_children"} style={{ height: getNodeChildren(node)?.length  < 10 ? `${getNodeChildren(node)?.length * 4}vh` : `${MAX_HEIGHT_SCROLL}vh`, width: "auto" }}>
                <AutoSizer>
                    {({ width, height }) => (
                        <List
                            width={width}
                            height={height}
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
            </ul>
        </li>

    const renderLeaf = (node, virtualizedEvent) =>
        <li style={virtualizedEvent?.style || {}} className={getNodeClasses(node, 'leaf')} key={node.id} onClick={withoutPropagation(() => toggleNode('selectedStatus')(node))} >
            <a>
                <span>{renderLeafNode(node, curriedFlip(toggleNode)(node))}</span>
            </a>
        </li>


    const renderNode = (node, virtualizedEvent) => {
        return node.isLeaf ? renderLeaf(node, virtualizedEvent) : renderBranch(node, virtualizedEvent)
    }

    const calculateRowHeight = useCallback((index) => {
        let height = nodeHeight
        const node = _.values(nodeIndex)[index.index]
        if (node?.expanded && node?.children?.length) {
            const vhInPixels = MAX_HEIGHT_SCROLL * window.innerHeight / 100
            const heightWithScroll = nodeHeight + (vhInPixels)
            const actualHeight = nodeHeight + (nodeHeight * node.children.length)
            height = heightWithScroll < actualHeight ? heightWithScroll : actualHeight
        }

        return height
    }, [nodeIndex])

    return (
        <div className={"fancy-tree"}>
            {!_.isEmpty(nodeIndex) ? <ul style={{ height: _.values(nodeIndex).filter(node => node.level === 0).length  < 10 ? `${_.values(nodeIndex).filter(node => node.level === 0).length * 4}vh` : `${MAX_HEIGHT_SCROLL}vh`, width: "auto" }}>
                <AutoSizer>
                    {({ width, height }) => (
                        <List
                            ref={listRef}
                            width={width}
                            height={height}
                            rowHeight={calculateRowHeight}
                            deferredMeasurementCache={reactVirtualizedCache.current}
                            rowRenderer={(virtualizedEvent) => {
                                const node = _.values(nodeIndex).filter(node => node.level === 0)[virtualizedEvent.index]
                                return (
                                    <CellMeasurer key={virtualizedEvent.key} cache={reactVirtualizedCache.current} parent={virtualizedEvent.parent} columnIndex={0} rowIndex={virtualizedEvent.index}>
                                        {renderNode(node, virtualizedEvent)}
                                    </CellMeasurer>
                                )
                            }}
                            rowCount={_.values(nodeIndex).filter(node => node.level === 0).length}
                        />
                    )}
                </AutoSizer>
            </ul> : null}
        </div>
    )
}

export default ReactiveTreeControl

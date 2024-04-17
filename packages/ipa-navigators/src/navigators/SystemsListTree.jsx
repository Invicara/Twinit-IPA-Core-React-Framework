import React, {useCallback, useEffect, useMemo, useReducer} from "react";
import _ from 'lodash'
import {produce} from "immer";
import {TreeNodeStatus, TreeNodeActionName} from "@invicara/ipa-core/modules/IpaUtils";
import {ReactiveTreeControl, AlertIndicator} from "@invicara/ipa-core/modules/IpaControls";
import './SystemsListTree.scss'
import sortSystemElementIdsAsDisplayedInTree, {getElementId} from "./sortSystemElements";
import {useDispatch, useSelector} from "react-redux";
import * as Systems from "../redux/slices/systems";
import Switch from "@material-ui/core/Switch/Switch";

const treeReducer = (state, action) => {
    switch (action.type) {
        case 'update_hidden': {
            const newNodeIndex = updateNodesVisibility(state.nodeIndex, action.isVisible);
            return {
                ...state,
                showOnlyCritical: action.showOnlyCritical,
                nodeIndex: newNodeIndex
            }
        }
        case 'update_selectedStatus': {
            const newNodeIndex = updateNodesSelection(state.nodeIndex, action.selectedElements, action.isSelected);
            return {
                ...state,
                selectedElements: action.selectedElements,
                nodeIndex: newNodeIndex
            }
        }
        case 'update_alerts': {
            const newNodeIndex = updateNodesAlerts(state.nodeIndex, action.alerts);
            return {
                ...state,
                alerts: action.alerts,
                nodeIndex: newNodeIndex
            }
        }
        case 'update_nodeIndex': {
            return {
                ...state,
                nodeIndex: action.nodeIndex
            }
        }
        default:
            return state;
    }
}

const initialTreeState = {nodeIndex : {}};

const updateNodesVisibility = (nodeIndex, isVisible)=> {
    const newNodeIndex = _.mapValues(nodeIndex, node => {
        const hidden =  !isVisible(node, nodeIndex);
        console.log("RECALCULATING hidden",node.id,hidden);
        return {
            ...node,
            hidden
        }
    });
    return newNodeIndex;
};

const updateNodesSelection = (nodeIndex, selectedElements, isSelected)=>{
    const newNodeIndex = _.mapValues(nodeIndex, node => {
        const selectedStatus = selectedElements.find(selectedElement=>isSelected(node,selectedElement)) ? TreeNodeStatus.ON : TreeNodeStatus.OFF;
        return {
            ...node,
            selectedStatus
        }
    });
    return newNodeIndex;
};

const updateNodesAlerts = (aNodeIndex, alerts)=>{
    let entityIdsWithAlertsUtilArr = [];
    for (const [entityType, alertsPerEntityMap] of Object.entries(alerts || {})) {
        entityIdsWithAlertsUtilArr = entityIdsWithAlertsUtilArr.concat(_.keys(alertsPerEntityMap));
    }
    let changes = 0;
    const newNodeIndex = produce(aNodeIndex,(nodeIndex)=>{
        for (const [key, node] of Object.entries(nodeIndex)) {
            const hasAlerts = _.intersection(entityIdsWithAlertsUtilArr, node.entityIds).length > 0;
            let currentAlerts = [];
            if (hasAlerts) {
                for (const [entityId, alertsArray] of Object.entries(alerts[node.systemElement.entityType])) {
                    if (node.entityIds.includes(entityId)) {
                        currentAlerts = currentAlerts.concat(alertsArray);
                    }
                }
            }
            const prevAlertIds = node.alerts && node.alerts.map(alert => alert._id);
            const currentAlertIds = currentAlerts.map(alert => alert._id);
            if (!_.isEqual(prevAlertIds, currentAlertIds)) {
                changes++;
                node.alerts = currentAlerts;
            }
        }
    });
    return newNodeIndex;
};

export const SystemsListTree = ({system, selectedElements, onSelect, title, defaultExpandedDepth = 3, bottomPanelFocusMode, onBottomPanelFocusModeChanged}) => {

    const dispatch = useDispatch();

    const toggleStyle = {
        switchBase: {
            '&$checked': {
                color: "#00A693",
            },
            '&$checked + $track': {
                backgroundColor: "#efefef",
            },
        },
        checked: {
            color: "#00a693ba",
        },
        track: {},
    }

    const alerts = useSelector(Systems.selectSystemsAlerts);

    const systemElementsIsolationFilters = useSelector(Systems.selectAppliedSystemElementIsolationFilters);

    const showOnlyCritical = systemElementsIsolationFilters?.['critical']?.['value']=='true';

    const getEntityIds = (systemElement) => {
        return (systemElement.entityInfo && systemElement.entityInfo.map(ei=>ei._id)) || [getElementId(systemElement)]
    };

    const isSelected = (node,selectedElement) => selectedElement && (node.id === getElementId(selectedElement) || node.entityIds.includes(getElementId(selectedElement)))

    const getLevel = (node, nodeIndex) => node?.parents && node.parents.length>0 ? getLevel(nodeIndex[node.parents[0]], nodeIndex) + 1 : 0;

    const isCritical = node => {
        const critical = _.get(node, 'nodeValue.critical')
        return critical
    }

    const isVisibleBackup = useCallback((node, nodeIndex) => {
        // controls showing or not showing nodes depending on expanded

        // top level always visible
        if (!node.parent) return true

        const parent = _.get(nodeIndex, node.parent, {})

        const isCritical = _.get(node, 'nodeValue.critical', false)

        const showBecauseIsCritical = (isCritical && showOnlyCritical)

        if (!isVisible(parent) && parent.expanded) {
            return showBecauseIsCritical
            // will hide if:
            // parent is not visible, and node is not critical, and "show only critical" switch is off
        }

        return parent.expanded
        // if parent is not expanded but node is critical + show only critical switch is on: show anyway
    },[showOnlyCritical]);

    //WORK IN PROGRESS, THERE MIGHT BE WORK NEEDED ON CRITICAL TREE
    const isVisible = useCallback((node,nodeIndex) => {

        if(!node) return false;
        // controls showing or not showing nodes depending on expanded

        const critical = isCritical(node);
        const hasCriticalChildren = addAllNodeDescendants(node, nodeIndex, []).filter(n=>isCritical(n)).length>0;
        // show/hide decision table
        // will hide if: node is not critical && and "show only critical" switch is on && has no critical children
        // c | soc | show result
        // __|_____|_______
        // 1 |  0  |  1
        // 1 |  1  |  1
        // 0 |  0  |  1
        // 0 |  1  |  0
        const hide = (!critical && showOnlyCritical && !hasCriticalChildren);

        const parent = _.isEmpty(node.parents) ? undefined : _.get(nodeIndex, node.parents[0], {});
        if(hasCriticalChildren){
            return true;
        }
        if(!parent){
            // node is top level
            return !hide;
        }

        const parentVisible = !isVisible(parent, nodeIndex);
        if (!parentVisible && parent.expanded) {
            // parent is not visible, but is expanded, we still might need to show the node
            return !hide;
        }
        //if parent is not expanded, we can skip showing the node
        return parent.expanded && !hide;
        // TODO: ? if parent is not expanded but node is critical + show only critical switch is on: show anyway
    },[showOnlyCritical]);

    const addAllNodeDescendants = (node, aNodeIndex, allDescendants) => {
        if(node.children){
            node.children.forEach(childId => {
                const child = aNodeIndex[childId];
                allDescendants.push(child);
                addAllNodeDescendants(child);
            });
        }
        return allDescendants;
    }

    const getNodeName = nodeValue => nodeValue["Entity Name"]

    const nodeIndexFromSystemElements = useMemo(() => {
        if(!system){
            return {};
        }
        const newBareNodeIndex = system.elements.map(se => {
            const el = {...se};
            const node = {
                "id": getElementId(se),
                "entityIds" :  getEntityIds(se),
                "order": el.localOrder,//order within this particular system
                //"parent": el.upstream,//TODO: deleted this property (Reactive Tree is using 'parents')
                "parents": el.upstream && /*prevent loop*/el.upstream!==getElementId(se) ? [el.upstream] : [],
                "children": el.downstream || system.elements.filter(ch=>!!ch.upstream && ch.upstream === getElementId(se) && /*prevent loop*/getElementId(ch)!==getElementId(se)).map(e=>e._id) || [],//TODO: fix that
                "critical": el.critical,
                "nodeValue": el,
                "systemElement" : se,
                "treeActions" : {
                    "selectedStatus" : {
                        [TreeNodeActionName.PROPAGATE_UP] : TreeNodeStatus.OFF,
                        //[TreeNodeActionName.PROPAGATE_DOWN] : TreeNodeStatus.OFF
                    }
                }
            };
            //new node properties that don't need the full nodeIndex yet
            node.alerts = false;
            node.isLeaf = _.isEmpty(node.children);
            node.selectedStatus = selectedElements.find(selectedElement=>isSelected(node,selectedElement)) ? TreeNodeStatus.ON : TreeNodeStatus.OFF;
            return node;
        }).reduce((index, current) => ({...index, [current.id]: current}), {})
        const unorderedNodeIndex =  _.mapValues(newBareNodeIndex, node => {
            const level = getLevel(node, newBareNodeIndex);
            const expanded = _.get(newBareNodeIndex, `${node.id}.expanded`, level<=defaultExpandedDepth ? true : false);
            const hidden =  !isVisible(node, newBareNodeIndex);
            return {
                ...node,
                //new node properties that need full nodeIndex to calculate a value
                hidden,
                level,
                expanded
            }
        });
        const {sortedSystemElementIds} = sortSystemElementIdsAsDisplayedInTree(system?.elements, getElementId);
        const newNodeIndex = {};
        sortedSystemElementIds.forEach(elementId => newNodeIndex[elementId] = unorderedNodeIndex[elementId]);
        return newNodeIndex;

    },[system,selectedElements]);

    const [treeState, treeDispatcher] = useReducer(treeReducer,{
        ...initialTreeState,
        selectedElements: selectedElements,
        defaultExpandedDepth: defaultExpandedDepth,
        showOnlyCritical: showOnlyCritical,
        nodeIndex: nodeIndexFromSystemElements
    });


    useEffect(()=>{
        if(treeState.showOnlyCritical!==showOnlyCritical) {
            treeDispatcher({type: "update_hidden", isVisible: isVisible, showOnlyCritical: showOnlyCritical});
        }
    },[showOnlyCritical]);

    useEffect(()=>{
        if(treeState.selectedElements!==selectedElements) {
            treeDispatcher({type: "update_selectedStatus", isSelected: isSelected, selectedElements: selectedElements});
        }
    },[selectedElements]);

    useEffect(()=>{
        if(treeState.alerts!==alerts) {
            treeDispatcher({type: "update_alerts", alerts: alerts});
        }
    },[alerts]);

    const nodeIndex = treeState.nodeIndex;

    const onNodeIndexChange = useCallback((newNodeIndex)=>{
        const selected = _.values(newNodeIndex).filter(node=>node.selectedStatus===TreeNodeStatus.ON).map(node=>node.systemElement._id);
        //sort them so newly selected is last
        //const selectedStatusOnPreviously = _.values(nodeIndex).filter(node=>node.selectedStatus===TreeNodeStatus.ON).map(node=>node.systemElement);
        const changed = _.differenceBy(_.values(newNodeIndex), _.values(nodeIndex), node => node.id+''+node.selectedStatus).map(node=>node.systemElement._id);
        treeDispatcher({type: "update_nodeIndex", nodeIndex: newNodeIndex});
        onSelect && onSelect(selected, changed);
    },[treeState.nodeIndex]);

    const toggleCritical = useCallback(()=> {
        const newFilters = {...systemElementsIsolationFilters};
        const newCriticalValue = !newFilters['critical'];
        if(newCriticalValue){
            newFilters['critical'] = {
                op:"equals",
                value:'true',
                type:"boolean"
            };
        } else {
            delete newFilters['critical']
        }
        dispatch(Systems.setIsolationFilters(newFilters));
    },[systemElementsIsolationFilters]);

    const treeControlLeafNodeRenderer = ({nodeValue, alerts, hidden}, toggleCurrentNode) =>
            nodeValue && !hidden && <div>
                {alerts && !_.isEmpty(alerts) && <AlertIndicator classNames={"alert-indicator-danger"} descriptions={alerts.map(alert=>alert?.properties?.Description?.val).filter(d=>!!d)}></AlertIndicator>}
                {nodeValue["Entity Name"]}
                { nodeValue["EntityWarningMessage"] &&
                    <div className="tooltip-wrapper">
                        <div className="dbm-tooltip">
                            <i className="fas fa-exclamation-circle"/>
                            <span className="dbm-tooltiptext">{nodeValue["EntityWarningMessage"]}</span>
                        </div>
                    </div>}
            </div>;

    const treeControlBranchNodeRenderer = (group, childrenCount, toggleCurrentNode) => {
        const childCount = group.count;
        const hidden = group.hidden;
        return (
            <span>
            {group.alerts && !_.isEmpty(group.alerts) && <AlertIndicator classNames={"alert-indicator-danger"} descriptions={group.alerts.map(alert=>alert?.properties?.Description?.val).filter(d=>!!d)}></AlertIndicator>}
            {getNodeName(group.nodeValue)}
            {!!childCount && <span className="count" style={{fontSize: "0.8em"}}>{childCount}</span>}
          </span>
        )
    };

    return <div className="tree-search systems-list-tree">

        {system && <div className={'viewer-toggle'}>
            <Switch style={toggleStyle} checked={bottomPanelFocusMode==false} onChange={onBottomPanelFocusModeChanged}/>Sync with Viewer
        </div>}

        {system && <div className={'viewer-toggle'}>
            <Switch style={toggleStyle} checked={systemElementsIsolationFilters?.['critical']?.['value']=='true'} onChange={toggleCritical}/>Show Only Critical
        </div>}

        {system && <label className='title'>Elements</label>}

        {
            !_.isEmpty(nodeIndex) ? <ReactiveTreeControl className="entity-tree"
                                                         renderLeafNode={treeControlLeafNodeRenderer}
                                                         renderBranchNode={treeControlBranchNodeRenderer}
                                                         nodeIndex={nodeIndex}
                                                         onNodeIndexChange={onNodeIndexChange}
            /> : <p className="tree-search__loading">Loading tree...</p>
        }
    </div>;
}

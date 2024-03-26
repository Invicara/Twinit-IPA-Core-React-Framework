import React, {useEffect, useState, useCallback, useMemo, useRef} from "react";
import interact from "interactjs";
import _ from 'lodash'
import clsx from "clsx";
import {Button, ButtonGroup, Tooltip} from "@material-ui/core";
import NavigatorSource from "./NavigatorSource";
import EntityDetailBottomPanel from "./EntityDetailBottomPanel";
import SystemDetailBottomPanel from "./SystemDetailBottomPanel";
import EntityDetailBottomPanelTitle from "./EntityDetailBottomPanelTitle";
import EntityClearSearchButton from "./EntityClearSearchButton";
import sortSystemElementIdsAsDisplayedInTree, {getElementId} from "./sortSystemElements";
import { SimpleTextReducer } from "@invicara/ipa-core/modules/IpaControls";
import {getFilteredEntitiesBy} from "@invicara/ipa-core/modules/IpaUtils";
import {getFilteredSystemElementEntitiesBy} from "../redux/slices/systems";

const NavigatorDetailBottomPanel = ({activeItemId, itemType, items, defaultSort, overrideSort,
                                     filters, getItemProperty,
                                     itemIdAccessor = "_id",itemNameAccessor = "Entity Name", onItemSelected,
                                     systemsEnabled = false,
                                     isSearchDrawerOpen, isFilterDrawerOpen, isDataDrawerOpen, isSystemDrawerOpen,
                                     toggleSearchDrawer, toggleFilterDrawer, toggleDataDrawer, toggleSystemDrawer,
                                     closeAllSearchDrawers, onClearSearchAndFilters,
                                     viewerMode, onViewerModeChanged, onReloadSearchTokenChanged}) => {

    const panel = useRef();

    const [currentSort, setCurrentSort] = useState(defaultSort);

    useEffect(()=> {
        if(overrideSort && !_.isEqual(overrideSort,currentSort)){
            setCurrentSort(overrideSort);
        }
    },[overrideSort]);

    const sortedItems = useMemo(() => {
        if(viewerMode===NavigatorSource.SYSTEM) {
            const {sortedSystemElementIds} = sortSystemElementIdsAsDisplayedInTree(items, getElementId);
            return sortedSystemElementIds.map(id=>items.find(item=>getElementId(item)===id));
        } else {
            return _.orderBy(items, currentSort.valueAccessor, currentSort.order);
        }
    },[items,currentSort,viewerMode]);

    const filteredItems = useMemo(() => {
        if(_.isEmpty(filters)){
            return sortedItems;
        }
        if(viewerMode===NavigatorSource.SYSTEM) {
            return getFilteredSystemElementEntitiesBy(sortedItems, filters);
        } else {
            return getFilteredEntitiesBy(sortedItems,filters);
        }
    },[sortedItems,filters]);

    const getIndexOfEntity = useCallback(() => {
        if(!activeItemId){
            return 0;
        }
        const i = filteredItems.findIndex(se=>se[itemIdAccessor]==activeItemId);
        const index = i<0 ? 0 : i;
        return index;
    },[activeItemId,itemIdAccessor,filteredItems]);

    //these two must always be updated by setState together
    const currentIndex = getIndexOfEntity();
    const [detailedEntityObject,setDetailedEntityObject] = useState({
        detailedEntityIndex: currentIndex,
        detailedEntity: filteredItems[currentIndex]
    });

    useEffect(()=> {
        const indexOfEntity = getIndexOfEntity();
        setDetailedEntityObject({
            detailedEntityIndex: indexOfEntity,
            detailedEntity: filteredItems[indexOfEntity]
        });
    },[getIndexOfEntity]);

    useEffect(()=> {
        onItemSelected && onItemSelected(detailedEntityObject.detailedEntity, itemType);
    },[detailedEntityObject]);


    const hasPreviousSelectedEntity = useCallback(() => detailedEntityObject.detailedEntityIndex > 0, [detailedEntityObject]);
    const hasNextSelectedEntity = useCallback(() => detailedEntityObject.detailedEntityIndex > -1 && detailedEntityObject.detailedEntityIndex < items?.length-1, [detailedEntityObject,items]);

    const _handlePreviousEntity = (_detailedEntityIndex, _hasPreviousGuard, _sortedEntities) => {
        if(_hasPreviousGuard()) {
            const newIndex = _detailedEntityIndex - 1;
            setDetailedEntityObject((prevDEO) => ({
                detailedEntityIndex: newIndex,
                detailedEntity: _sortedEntities[newIndex]
            }));
        }
    }

    const _handleNextEntity = (_detailedEntityIndex, _hasNextGuard, _sortedEntities) => {
        if(_hasNextGuard()) {
            const newIndex = _detailedEntityIndex + 1;
            setDetailedEntityObject((prevDEO)=> ({
                detailedEntityIndex: newIndex,
                detailedEntity: _sortedEntities[newIndex]
            }));
        }
    }

    const handlePreviousEntity = useCallback(() => _handlePreviousEntity(detailedEntityObject.detailedEntityIndex, hasPreviousSelectedEntity, filteredItems), [detailedEntityObject, filteredItems]);
    const handleNextEntity = useCallback(() => _handleNextEntity(detailedEntityObject.detailedEntityIndex, hasNextSelectedEntity, filteredItems), [detailedEntityObject, filteredItems]);

    const shouldDisplayEntityPager = useMemo(() => (detailedEntityObject.detailedEntity !== undefined && items?.length > 1 && detailedEntityObject.detailedEntityIndex > -1),[detailedEntityObject,items.length]);

    const allowedToBeOpened = useMemo(() => (detailedEntityObject.detailedEntity !== undefined),[detailedEntityObject]);

    const [bottomPanelState, setBottomPanelState] = useState('default');//states: default, opened, closed
    const openBottomPanel = useCallback(()=>setBottomPanelState('opened'),[]);
    const closeBottomPanel = useCallback(()=>setBottomPanelState('closed'),[]);

    const setViewerMode = useCallback((mode)=>{
        return ()=>{
            onViewerModeChanged(mode);}
    },[]);

    const bottomPanelContentComponent = () => {
        switch (viewerMode) {
            case NavigatorSource.SYSTEM:
                return <SystemDetailBottomPanel
                    entities={detailedEntityObject?.detailedEntity?.entityInfo || [detailedEntityObject.detailedEntity]}
                    entityType={detailedEntityObject?.detailedEntity?.entityType || itemType}
                />;
            default:
                return <EntityDetailBottomPanel
                    detailedEntity={detailedEntityObject.detailedEntity}
                />;
        }
    }

    const bottomPanelTitleComponent = () => {
        switch (viewerMode) {
            case NavigatorSource.SEARCH:
                return <EntityDetailBottomPanelTitle
                    detailedEntity={detailedEntityObject.detailedEntity}
                    onReloadSearchTokenChanged={onReloadSearchTokenChanged}
                />;
            default:
                return null;
        }
    }

    useEffect(()=> {
        // if d && closed => keep closed
        // if d && open => keep opened
        // if d && default => keep default (this will cause opening)
        // if !d && closed => keep closed
        // if !d && open => set to default (this will cause closing)
        if(!detailedEntityObject.detailedEntity && bottomPanelState=='opened'){
            setBottomPanelState("default");
        }
        // if !d && default => keep default (this will cause closing)
    },[detailedEntityObject]);

    useEffect(() => {
        interact(panel.current).resizable({
            edges: { left: false, right: false, bottom: false, top: '.bottom-panel.open .bottom-panel-title-bar' },
            listeners: {
                move (event) {
                    let {rect} = event.rect;//The edges of the element that are being changed
                    let {deltaRect} = event.deltaRect;//The change in dimensions since the previous event
                    let {edges} = event.edges;//An object with the new dimensions of the target

                    //show deltaReact in element for debugging purposes
                    let { x, y } = event.target.dataset;
                    x = (parseFloat(x) || 0) /*+ event.deltaRect.left*/;
                    y = (parseFloat(y) || 0) + event.deltaRect.top;
                    Object.assign(event.target.dataset, { x, y });

                    //update height as we move upwards only
                    if(event.rect.height>40 /*top panel size*/){
                        Object.assign(event.target.style, {
                            //width: `${event.rect.width}px`,
                            height: `${event.rect.height}px`,
                            //transform: `translate(${x}px, ${y}px)`
                        });
                        const panelInner = event.target.querySelector('.bottom-panel-content.open');
                        Object.assign(panelInner.style, {
                            height: `${event.rect.height}px`,
                        });
                    }
                },
                start(event){
                },
                end(event){
                }
            },
        })
    }, [panel.current])

    const buttonStyle=useMemo(()=>{return {minWidth: '0px'} },[]);

    return <div ref={panel} className={clsx("bottom-panel", {
        "open" : detailedEntityObject.detailedEntity && (bottomPanelState=='default' || bottomPanelState=="opened"),
        "closed" : !detailedEntityObject.detailedEntity || bottomPanelState=='closed'
    })}>
        <div className="bottom-panel-title-bar">
            <div className="navigator-bottom-first-col-wrap right-bar">
                <span className="p-h-5">
                <ButtonGroup size="small" variant="contained" >
                    <Button title={"Enable Search Mode"} disableElevation variant="text" styles={buttonStyle} size="small" className={clsx('GenericMatGroupButton',{'active' : viewerMode===NavigatorSource.SEARCH})} onClick={setViewerMode(NavigatorSource.SEARCH)}>Search</Button>
                    <Button title={"Toggle Search Panel"} disableElevation styles={buttonStyle} size="small" className={clsx('GenericMatGroupButton',{'active-secondary' : isSearchDrawerOpen})} disabled={viewerMode!==NavigatorSource.SEARCH} onClick={toggleSearchDrawer}><i className="fas fa-search"/></Button>
                    <Button title={"Toggle Filter and Group Panel"} disableElevation styles={buttonStyle} size="small" className={clsx('GenericMatGroupButton',{'active-secondary' : isFilterDrawerOpen})} disabled={viewerMode!==NavigatorSource.SEARCH} onClick={toggleFilterDrawer}><i className="fas fa-filter"/></Button>
                    <Button title={"Toggle List Panel"} disableElevation styles={buttonStyle} size="small" className={clsx('GenericMatGroupButton',{'active-secondary' : isDataDrawerOpen})} disabled={viewerMode!==NavigatorSource.SEARCH} onClick={toggleDataDrawer}><i className="fas fa-list"/></Button>
                    <Button title={"Close All Panels"}  disableElevation styles={buttonStyle} size="small" className="GenericMatGroupButton" disabled={viewerMode!==NavigatorSource.SEARCH} onClick={closeAllSearchDrawers}><i className="fas fa-angle-double-left"/></Button>
                </ButtonGroup>
                </span>
                <span className="p-h-5">
                    <EntityClearSearchButton
                        buttonStyle={buttonStyle}
                        viewerMode={viewerMode}
                        onClearSearchAndFilters={onClearSearchAndFilters}
                    />
                </span>
            </div>
            {systemsEnabled && <div className="p-h-10">
                <ButtonGroup size="small" variant="contained">
                    <Button disableElevation variant="text" styles={buttonStyle} size="small" className={clsx('GenericMatGroupButton',{'active' : viewerMode===NavigatorSource.SYSTEM})} disabled={!detailedEntityObject.detailedEntity} onClick={setViewerMode(NavigatorSource.SYSTEM)}>Systems</Button>
                    <Button disableElevation styles={buttonStyle} size="small" className={clsx('GenericMatGroupButton',{'active-secondary' : isSystemDrawerOpen})} disabled={viewerMode!==NavigatorSource.SYSTEM} onClick={toggleSystemDrawer}><i className="fas fa-search"/></Button>
                </ButtonGroup>
            </div>}
            <div className="bottom-panel-title">
            {detailedEntityObject.detailedEntity && (
                <React.Fragment>
                    {shouldDisplayEntityPager && <div className="bottom-panel__entity-controls">
                        <i onClick={handlePreviousEntity} className={`fas fa-angle-left arrow arrow-left ${hasPreviousSelectedEntity ? "" : "arrow-disabled"}`}/>
                        <p className="text">{detailedEntityObject.detailedEntityIndex+1} of {items.length}</p>
                        <i onClick={handleNextEntity} className={`fas fa-angle-right arrow arrow-right ${hasNextSelectedEntity ? "" : "arrow-disabled"}`}/>
                    </div>
                    }
                    <SimpleTextReducer text={detailedEntityObject.detailedEntity[itemNameAccessor] || detailedEntityObject.detailedEntity[itemType+' Name']} limit={50} />
                    <div>{bottomPanelTitleComponent()}</div>
                </React.Fragment>
            )}
            </div>
            <div className={'navigator-bottom-icons left-barx under-toolbarx'}>
                <div className={"navigator-bottom-right-icons"}>
                    <div className="p-h-5">
                        <ButtonGroup size="small" variant="contained" >
                            {detailedEntityObject.detailedEntity && (bottomPanelState=='closed') &&
                                <Button disableElevation styles={buttonStyle} size="small" className="GenericMatGroupButton" disabled={!detailedEntityObject.detailedEntity} onClick={openBottomPanel}><Tooltip key={"icon-expand-panel"} title="Expand panel"><i className="fas fa-angle-double-up"/></Tooltip></Button>
                            }
                            {(bottomPanelState=='opened' || (detailedEntityObject.detailedEntity && bottomPanelState=='default')) &&
                                <Button disableElevation styles={buttonStyle} size="small" className="GenericMatGroupButton" disabled={!detailedEntityObject.detailedEntity} onClick={closeBottomPanel}><Tooltip key={"icon-collapse-panel"} title="Collapse panel"><i className="fas fa-angle-double-down"/></Tooltip></Button>
                            }
                        </ButtonGroup>
                    </div>
                </div>
            </div>
        </div>
        {detailedEntityObject.detailedEntity &&
            <div className={clsx("bottom-panel-content", {
                "open" : detailedEntityObject.detailedEntity && (bottomPanelState=='default' || bottomPanelState=="opened"),
                "closed" : !detailedEntityObject.detailedEntity || bottomPanelState=='closed'
            })}>
                {bottomPanelContentComponent()}
            </div>
        }

    </div>
}

export default NavigatorDetailBottomPanel
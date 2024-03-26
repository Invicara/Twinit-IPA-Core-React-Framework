import React, {useState, useMemo, useEffect, useRef, useCallback, useContext} from "react";
import PropTypes from "prop-types";

import {
    withEntityConfig, useSortEntities
} from "@invicara/ipa-core/modules/IpaPageComponents";
import {useDispatch, useSelector} from "react-redux";
import {Entities} from "@invicara/ipa-core/modules/IpaRedux";
import _ from 'lodash'
import {EnhancedIafViewer} from "../../navigators/EnhancedIafViewer";
import EntitySearchPanels from "../../navigators/EntitySearchPanels";
import NavigatorSource from "../../navigators/NavigatorSource";
import { extractSpacesFromEntities } from "../../navigators/EntityEnabledIafViewer";
import SystemSearchPanels from "../../navigators/SystemSearchPanels";
import * as Systems from "../../redux/slices/systems";
import NavigatorDetailBottomPanel from "../../navigators/NavigatorDetailBottomPanel";
import {withEntityStore} from "@invicara/ipa-core/modules/IpaPageComponents";
import {
    selectSystemElementsFromModels,
    clearAll,
    setFocusedSystemElementEntity
} from "../../redux/slices/systems";




const NavigatorView =  (props) => {

    const EMPTY_ARRAY = useMemo(()=>[],[]);

    const systemsEnabled = props.handler?.config?.panels?.Systems?.enabled || false /*default value at the moment is false*/;

    const [viewerMode, setViewerMode] = useState(NavigatorSource.SEARCH);
    const [bottomPanelFocusMode, setBottomPanelFocusMode] = useState(viewerMode == NavigatorSource.SEARCH ? true : false);


    const [reloadSearchToken,setReloadSearchToken] = useState(Math.floor((Math.random() * 100) + 1));
    const onReloadSearchTokenChanged = useCallback((token)=>setReloadSearchToken(token),[])

    const searchEntityType = useSelector(Entities.getCurrentEntityType);

    const [viewerSelectedEntitiesBySearch, setViewerSelectedEntitiesBySearch] = useState([]);

    const isolatedEntitiesBySearch = useSelector(Entities.getIsolatedEntities);
    const allEntitiesBySearch = useSelector(Entities.getAllCurrentEntities);

    const isolatedEntitiesBySystem = useSelector(Systems.selectIsolatedSystemElementEntities);
    const appliedSystemFilters = useSelector(Systems.selectAppliedSystemElementIsolationFilters);
    const hiddenEntitiesBySystem = useSelector(Systems.selectHiddenIsolatedSystemElementEntities);

    const selectedEntitiesBySearch = useSelector(Entities.getSelectedEntities);
    const selectedEntitiesBySystem = useSelector(Systems.selectedSystemElementEntities);
    const focusedEntityBySystem = useSelector(Systems.focusedSystemElementEntity);


    const [isSearchDrawerOpen, setSearchDrawerOpen] = useState(false);
    const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [isDataDrawerOpen, setDataDrawerOpen] = useState(false);
    const [isSystemDrawerOpen, setSystemDrawerOpen] = useState(NavigatorSource.SYSTEM===viewerMode);

    //REACT TO BOTTOM PANEL BUTTON CLICK - VIEWER MODE CHANGE
    const onViewerModeChanged = (newViewerMode) => {
        setViewerMode(newViewerMode);
    }

    const onBottomPanelFocusModeChanged = () => {
        setBottomPanelFocusMode(!bottomPanelFocusMode);
    }

    const openSearchDrawer = () => {!isSearchDrawerOpen && setSearchDrawerOpen(true)};
    const openFilterDrawer = () => {!isFilterDrawerOpen && setFilterDrawerOpen(true)};
    const openDataDrawer = () => {!isDataDrawerOpen && setDataDrawerOpen(true)};

    const toggleSearchDrawer = () => {setSearchDrawerOpen(!isSearchDrawerOpen)};
    const toggleFilterDrawer = () => {setFilterDrawerOpen(!isFilterDrawerOpen)}
    const toggleDataDrawer = () => {setDataDrawerOpen(!isDataDrawerOpen)}
    const toggleSystemDrawer = () => {setSystemDrawerOpen(!isSystemDrawerOpen);}

    const closeAllSearchDrawers = () => {
        isDataDrawerOpen && toggleDataDrawer();
        isFilterDrawerOpen && toggleFilterDrawer();
        isSearchDrawerOpen && toggleSearchDrawer();
    }

    const clearSearchAndFilters = () => {
        isDataDrawerOpen && toggleDataDrawer();
        isFilterDrawerOpen && toggleFilterDrawer();
    }

    const [entitiesListSort, setEntitiesListSort] = useState({});
    const onEntityListSortChange = (newSort) => {
        const entityType = searchEntityType.singular;
        setEntitiesListSort({...entitiesListSort,[entityType]:newSort})
    }

    const initialViewModeRender = useRef(true);
    useEffect(()=>{
        switch (viewerMode) {
            case NavigatorSource.SYSTEM:
                //when system is clicked, always open the drawer
                setSystemDrawerOpen(true);
                //don't select from bottom panel, but from system tree
                setBottomPanelFocusMode(false);
                break;
            case NavigatorSource.SEARCH:
                //if we clicked search, open drawer (but not by default)
                !initialViewModeRender.current && setSearchDrawerOpen(true);
                //TODO:
                //always focus on bottom panel entity this is TODO
                setBottomPanelFocusMode(true);
                break;
            default:
                ;
        }
        initialViewModeRender.current = false;
    },[viewerMode]);

    const prev_allEntitiesBySearch = useRef(allEntitiesBySearch);
    useEffect(()=>{
        let shouldSearchDrawerBeOpened = isSearchDrawerOpen; //|| initialDrawerState.current;
        let shouldFilterDrawerBeOpened = isFilterDrawerOpen;
        let shouldDataDrawerBeOpened = isDataDrawerOpen;
        if(viewerMode===NavigatorSource.SEARCH){
            //if same viewer mode but entities fetched
            if(_.isEmpty(allEntitiesBySearch)){
                shouldSearchDrawerBeOpened = true;
                shouldFilterDrawerBeOpened = false;
                shouldDataDrawerBeOpened = false;
            } else if(!_.isEqual(allEntitiesBySearch, prev_allEntitiesBySearch.current) && _.isEmpty(selectedEntitiesBySearch)) {
                //if fetch changed, and nothing is selected yet
                shouldSearchDrawerBeOpened = false;
                shouldDataDrawerBeOpened = true;
                shouldFilterDrawerBeOpened = true;
            } else {
                //do not reopen drawers if they are closed on purpose
                //shouldSearchDrawerBeOpened = false;
                //shouldDataDrawerBeOpened = true;
                //shouldFilterDrawerBeOpened = true;
            }
        }
        //now set the drawers state accordingly
        if(shouldSearchDrawerBeOpened){
            openSearchDrawer();
        } else {
            isSearchDrawerOpen && toggleSearchDrawer();
        }
        if(shouldFilterDrawerBeOpened){
            openFilterDrawer();
        } else {
            isFilterDrawerOpen && toggleFilterDrawer();
        }
        if(shouldDataDrawerBeOpened){
            openDataDrawer();
        } else {
            isDataDrawerOpen && toggleDataDrawer();
        }
        //initialDrawerState.current=false;
        prev_allEntitiesBySearch.current = allEntitiesBySearch;
    },[allEntitiesBySearch]);

    useEffect(()=>{
       console.log("selection changed: ",selectedEntitiesBySearch);
    },[selectedEntitiesBySearch]);

    useEffect(()=>{
        console.log("all entities changed: ",allEntitiesBySearch);
    },[allEntitiesBySearch]);


    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////////SYNC VIEWER////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    /*REACT TO ENTITY CHANGED IN SEARCH PANELS*/
    const onDetailSearchEntityChanged = (detailEntity) => {
        //clear system panel
        dispatch(clearAll());
    }
    /*REACT TO ENTITY CHANGED IN SYSTEM PANELS*/
    const onDetailSystemEntityChanged = (detailEntity, detailType) => {
        console.log("onDetailSystemEntityChanged ",detailEntity, detailType, selectedEntitiesBySystem);
        if(!detailEntity){
            //TODO: maybe reset system?
            dispatch(setFocusedSystemElementEntity(undefined));
            return;
        }
        //in case our system entity should always come from bottom panel items, therefore should be in the correct format
        //const focusedEntity = {...detailEntity, entityInfo: [detailEntity], entityType: detailType};
        if(detailEntity._id !== focusedEntityBySystem?._id) {
            dispatch(setFocusedSystemElementEntity(detailEntity));
        }
    }
    /*REACT TO ENTITY CHANGED IN BOTTOM PANEL*/
    const onBottomPanelItemChanged = (detail, detailType) => {
        viewerMode===NavigatorSource.SEARCH && onDetailSearchEntityChanged(detail);
        viewerMode===NavigatorSource.SYSTEM && onDetailSystemEntityChanged(detail, detailType);
    }
    //////////////////////////////////////////////////////////////////////////////

    const [themeColor, setThemeColor] = useState(undefined);
    const onSystemChanged = (system) => {
        if(!system){
            setThemeColor(undefined);
            return;
        }
        setThemeColor(system?.properties['System Color']?.val);
    }



    /*REACT TO ENTITY CHANGED IN VIEWER*/
    const dispatch = useDispatch();
    const handleModelIdsSelectionFromViewer = viewerSelectedEntities => {
        if(viewerMode===NavigatorSource.SEARCH) {
            setViewerSelectedEntitiesBySearch(viewerSelectedEntities);
        }
        if(viewerMode===NavigatorSource.SYSTEM) {
            dispatch(selectSystemElementsFromModels(viewerSelectedEntities ? viewerSelectedEntities : []));
        }
    }
    /*REACT TO new system element clicked on viewer*/
    useEffect(()=>{
        if(isolatedEntitiesBySystem.length>0 || selectedEntitiesBySystem.length>0){
            viewerMode!==NavigatorSource.SYSTEM && setViewerMode(NavigatorSource.SYSTEM);
        }
    },[isolatedEntitiesBySystem,selectedEntitiesBySystem])

    useEffect(()=>{
        if(isolatedEntitiesBySearch.length>0 || selectedEntitiesBySearch.length>0){
            viewerMode!==NavigatorSource.SEARCH && setViewerMode(NavigatorSource.SEARCH);
        }
    },[isolatedEntitiesBySearch,selectedEntitiesBySearch])


    const {isolatedSpaces: isolatedSpacesBySearch, isolatedRemainingEntities: isolatedRemainingEntitiesBySearch} = useMemo(()=>extractSpacesFromEntities(isolatedEntitiesBySearch||[]),[isolatedEntitiesBySearch]);
    const {isolatedSpaces: isolatedSpacesBySystem, isolatedRemainingEntities: isolatedRemainingEntitiesBySystem} = useMemo(()=>extractSpacesFromEntities(isolatedEntitiesBySystem||[]),[isolatedEntitiesBySystem]);

    const detailEntityBySearch = useMemo(()=>{
        if(selectedEntitiesBySearch.length>0){
            const entity = selectedEntitiesBySearch[selectedEntitiesBySearch.length-1];
            //make it compatible with redux systems entities
            return {...entity, entityInfo: [entity], entityType: searchEntityType.singular};
        }
        return undefined;
    },[selectedEntitiesBySearch]);

    const detailEntityBySearchAsArray = useMemo(()=>[detailEntityBySearch],[detailEntityBySearch]);

    useEffect(()=>{
        //initially populate viewer, so the viewer isn't empty when switching systems
        if(viewerMode===NavigatorSource.SYSTEM && _.isEmpty(isolatedEntitiesBySystem)){
            if(detailEntityBySearch){
                dispatch(Systems.setIsolatedSystemElementEntities(detailEntityBySearchAsArray));
                dispatch(Systems.setSelectedSystemElementEntities(detailEntityBySearchAsArray));
            }
        }
    },[viewerMode, detailEntityBySearchAsArray]);


    //the original requirement was to fetch systems each time you click on any system element
    //new requirement - the system root entity is the one from the search
    let detailEntityBySystem = undefined;
    if(selectedEntitiesBySystem.length>0){
        detailEntityBySystem = selectedEntitiesBySystem[selectedEntitiesBySystem.length-1];
    }
    const rootEntityForSystemsPanelSource = NavigatorSource.SEARCH;//detailEntityBySystem ? NavigatorSource.SYSTEM : NavigatorSource.SEARCH;
    const rootEntityForSystemsPanel = detailEntityBySearch;//rootEntityForSystemsPanelSource===NavigatorSource.SYSTEM ? detailEntityBySystem : detailEntityBySearch;

    //entity for bottom panel
    const currentBottomPanelEntity = viewerMode===NavigatorSource.SYSTEM ? (focusedEntityBySystem || rootEntityForSystemsPanel) : detailEntityBySearch;
    //const currentBottomPanelEntity = viewerMode===NavigatorSource.SYSTEM ? rootEntityForSystemsPanel : detailEntityBySearch;
    const currentBottomPanelEntityType = currentBottomPanelEntity?.entityType || searchEntityType.singular;
    const currentBottomPanelItems = viewerMode===NavigatorSource.SYSTEM ? selectedEntitiesBySystem : selectedEntitiesBySearch;

    //TODO: if system it should be exactly as tree sort, so this needs new hook
    const initialSystemElementsSort = {
        property: 'Entity Name',
        valueAccessor: 'Entity Name',
        order: 'asc'
    };
    const entitiesSortHook = useSortEntities(searchEntityType.singular).currentSort;
    const defaultBottomPanelSort = viewerMode===NavigatorSource.SYSTEM ? initialSystemElementsSort : entitiesSortHook;
    const overrideSort = viewerMode===NavigatorSource.SYSTEM ? initialSystemElementsSort : entitiesListSort[currentBottomPanelEntityType];

    const selected = useMemo(()=>focusedEntityBySystem ? [focusedEntityBySystem] : [],[focusedEntityBySystem]);

    return (
        <div className='navigator-view'>
            <div className='navigator-viewer'>
                <EnhancedIafViewer
                    name={'NavigatorViewer'}
                    model={props.selectedItems.selectedModel}
                    viewerResizeCanvas={true}
                    isolatedEntities={viewerMode===NavigatorSource.SYSTEM ? isolatedEntitiesBySystem : isolatedEntitiesBySearch}
                    hiddenEntities={viewerMode===NavigatorSource.SYSTEM ? hiddenEntitiesBySystem : undefined}
                    coloredElements={viewerMode===NavigatorSource.SYSTEM ? isolatedEntitiesBySystem : undefined}
                    themeColor={themeColor}
                    selectedEntities={viewerMode===NavigatorSource.SYSTEM ? (bottomPanelFocusMode ? selected : selectedEntitiesBySystem) : selectedEntitiesBySearch}
                    isolatedSpaces={viewerMode===NavigatorSource.SYSTEM ? isolatedSpacesBySystem : isolatedSpacesBySearch}
                    isolatedRemainingEntities={viewerMode===NavigatorSource.SYSTEM ? isolatedRemainingEntitiesBySystem : isolatedRemainingEntitiesBySearch}
                    hiddenElementIds={EMPTY_ARRAY}
                    onSelect={handleModelIdsSelectionFromViewer}
                />
            </div>
            <div className='navigator-view__panels'>
                <EntitySearchPanels
                    {...props}
                    viewerMode={viewerMode}
                    viewerSelectedEntities={viewerSelectedEntitiesBySearch}
                    onDetailEntityChanged={onDetailSearchEntityChanged}
                    isSystemDrawerOpen={isSystemDrawerOpen}
                    isSearchDrawerOpen={isSearchDrawerOpen}
                    isDataDrawerOpen={isDataDrawerOpen}
                    isFilterDrawerOpen={isFilterDrawerOpen}
                    toggleSystemDrawer={toggleSystemDrawer}
                    clearSystems={_.noop}
                    onEntityListSortChange={onEntityListSortChange}
                    entitySingular={searchEntityType.singular}
                    reloadSearchToken={reloadSearchToken}
                    onReloadSearchTokenChanged={onReloadSearchTokenChanged}
                />

                {rootEntityForSystemsPanel && viewerMode===NavigatorSource.SYSTEM &&
                            <SystemSearchPanels
                                bottomPanelFocusMode={bottomPanelFocusMode}
                                onBottomPanelFocusModeChanged={onBottomPanelFocusModeChanged}
                                rootEntity={rootEntityForSystemsPanel}
                                rootEntityType={rootEntityForSystemsPanel.entityType}
                                onSystemChanged={onSystemChanged}
                                viewerMode={viewerMode}
                            />}

                <NavigatorDetailBottomPanel
                    activeItemId={currentBottomPanelEntity?._id}
                    itemType={currentBottomPanelEntityType}
                    items={currentBottomPanelItems}

                    defaultSort={defaultBottomPanelSort}
                    overrideSort={overrideSort}
                    filters={viewerMode===NavigatorSource.SYSTEM ? appliedSystemFilters : undefined}

                    onItemSelected={onBottomPanelItemChanged}
                    onReloadSearchTokenChanged={onReloadSearchTokenChanged}

                    systemsEnabled={systemsEnabled}
                    viewerMode={viewerMode}
                    onViewerModeChanged={onViewerModeChanged}
                    isDataDrawerOpen={isDataDrawerOpen}
                    isFilterDrawerOpen={isFilterDrawerOpen}
                    isSearchDrawerOpen={isSearchDrawerOpen}
                    isSystemDrawerOpen={isSystemDrawerOpen}
                    toggleDataDrawer={toggleDataDrawer}
                    toggleFilterDrawer={toggleFilterDrawer}
                    toggleSearchDrawer={toggleSearchDrawer}
                    toggleSystemDrawer={toggleSystemDrawer}
                    closeAllSearchDrawers={closeAllSearchDrawers}
                    onClearSearchAndFilters={clearSearchAndFilters}
                    clearSystems={_.noop}

                ></NavigatorDetailBottomPanel>


            </div>
        </div>
    );

}

NavigatorView.contextTypes = {
    ifefPlatform: PropTypes.object,
    ifefSnapper: PropTypes.object,
    ifefNavDirection: PropTypes.string,
    ifefShowPopover: PropTypes.func,
    ifefUpdatePopover: PropTypes.func,
    ifefUpdatePopup: PropTypes.func,
    ifefShowModal: PropTypes.func
};

export default withEntityStore(withEntityConfig(NavigatorView));


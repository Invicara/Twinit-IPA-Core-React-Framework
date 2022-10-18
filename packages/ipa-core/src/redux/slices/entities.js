import {entitiesSliceFactory} from "./entities-higher-order-reducer";

const {reducer, actionCreators, selectors, thunks} = entitiesSliceFactory('General')
export default reducer;

//Public selectors
export const getAllCurrentEntities = selectors.getAllCurrentEntities

export const getAppliedFilters = selectors.getAppliedFilters

export const getAppliedGroups = selectors.getAppliedGroups

export const getFilteredEntities = selectors.getFilteredEntities

export const getIsolatedEntities = selectors.getIsolatedEntities

export const getSelectedEntities = selectors.getSelectedEntities

export const getFetchingCurrent = selectors.getFetchingCurrent

export const isViewerSyncOn = selectors.isViewerSyncOn

export const isSelectingEntities = selectors.isSelectingEntities

export const getCurrentEntityType = selectors.getCurrentEntityType

export const getSnapshot = selectors.getSnapshot

//Action creators
export const {
    setEntities, setFetching, resetEntities, setViewerSyncOn, setIsolatedEntities, setIsolatedEntitiesIds, setSelectedEntities, setCurrentEntityType, setSelecting,
    applyFiltering, resetFiltering, applyGrouping, resetGrouping, resetForFilteringAndGrouping, addEntity, deleteEntity, updateEntity, clearEntities, loadSnapshot, clearForNewEntityType
} = actionCreators;

//Thunks
export const selectEntitiesFromModels = thunks.selectEntitiesFromModels;

export const changeEntity = thunks.changeEntity;

export const fetchEntities = thunks.fetchEntities;


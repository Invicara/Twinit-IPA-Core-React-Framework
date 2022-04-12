import {entitiesSliceFactory} from "./entities-higher-order-reducer";

const {reducer, actionCreators, selectors, thunks} = entitiesSliceFactory('PluggableSearch')
export default reducer;

//Public selectors
export const getAllCurrentSearchedEntities = selectors.getAllCurrentEntities

export const getSelectedSearchedEntities = selectors.getSelectedEntities

export const getSearchingCurrent = selectors.getFetchingCurrent

export const getCurrentSearchEntityType = selectors.getCurrentEntityType

export const getAppliedSearchFilters = selectors.getAppliedFilters

//Action creators
export const resetSearchedEntities = actionCreators.resetEntities

export const clearSearchedEntities = actionCreators.clearEntities

export const applySearchFiltering = actionCreators.applyFiltering

export const setSelectedSearchedEntities = actionCreators.setSelectedEntities

//Thunks
export const searchEntities = thunks.fetchEntities;
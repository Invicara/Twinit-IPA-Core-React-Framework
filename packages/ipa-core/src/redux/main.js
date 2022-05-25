import {
    clearEntities,
    getAllCurrentEntities,
    getAppliedFilters,
    getCurrentEntityType,
    getFetchingCurrent,
    getIsolatedEntities,
    getSelectedEntities,
    isSelectingEntities,
    isViewerSyncOn,
    selectEntitiesFromModels,
    setEntities,
    setIsolatedEntities,
    setViewerSyncOn,
    getSnapshot
} from "./slices/entities";

import * as modal from './slices/modal'


import {getUser, setUser} from './slices/user'
import {
    applySearchFiltering,
    clearSearchedEntities,
    getAllCurrentSearchedEntities,
    getAppliedSearchFilters,
    getCurrentSearchEntityType,
    getSearchingCurrent,
    getSelectedSearchedEntities,
    resetSearchedEntities,
    searchEntities,
    setSelectedSearchedEntities
} from "./slices/entities-pluggable-search";
import {getEntitySelectConfig, setUserConfig} from "./slices/user-config";

const redux = {
    Entities: {
        getCurrentEntityType,
        getIsolatedEntities,
        getSelectedEntities,
        isViewerSyncOn,
        selectEntitiesFromModels,
        clearEntities,
        getAllCurrentEntities,
        getAppliedFilters,
        getFetchingCurrent,
        isSelectingEntities,
        setEntities,
        setIsolatedEntities,
        setViewerSyncOn,
        getSnapshot
    },
    EntitiesPluggableSearch: {
        getAllCurrentSearchedEntities,
        getSelectedSearchedEntities,
        getSearchingCurrent,
        getCurrentSearchEntityType,
        getAppliedSearchFilters,
        resetSearchedEntities,
        clearSearchedEntities,
        applySearchFiltering,
        setSelectedSearchedEntities,
        searchEntities
    },
    User: {
        getUser,
        setUser,
        setUserConfig,
        getEntitySelectConfig
    },
    Modals: {
        ...modal.actions
    }
}

export default redux
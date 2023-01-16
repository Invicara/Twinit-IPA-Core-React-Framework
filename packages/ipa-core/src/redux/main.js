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
import {
    fetchAllNamedUserItems, fetchNamedUserItemItems,
    namedUserItemActions, selectNamedUserItemById,
    selectNamedUserItemEntities, selectNamedUserItemsLoadingStatus,
    fetchNamedUserTotalAmountOfItems, importDataValidation, 
    SelectNamedUserItemsErrorStatus, fileImport, SelectNamedUserItemsImportStatus
} from "./slices/named-user-item.slice";
import { addEntityComponents } from "./slices/entityUI"

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
    },
    NamedUserItems: {
        fetchAllNamedUserItems,
        fetchNamedUserItemItems,
        selectNamedUserItemEntities,
        selectNamedUserItemsLoadingStatus,
        selectNamedUserItemById,
        SelectNamedUserItemsErrorStatus,
        SelectNamedUserItemsImportStatus,
        ...namedUserItemActions,
        fetchNamedUserTotalAmountOfItems,
        importDataValidation,
        fileImport
    }, 
    EntityUi: {
        addEntityComponents
    }
}

export default redux
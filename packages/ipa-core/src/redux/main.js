import {
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
    setViewerSyncOn
} from "./slices/entities";

import entitiesHigherOrderReducer from './slices/entities-higher-order-reducer'

import {getUser} from './slices/user'

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
        setViewerSyncOn,
        entitiesHigherOrderReducer
    },
    User: {
        getUser
    }
}

export default redux
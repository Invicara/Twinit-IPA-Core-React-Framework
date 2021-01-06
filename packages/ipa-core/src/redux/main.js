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
        setViewerSyncOn
    },
    User: {
        getUser
    }
}

export default redux
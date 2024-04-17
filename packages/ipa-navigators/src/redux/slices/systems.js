import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import _ from "lodash";
import {ScriptHelper, applyFilters} from "@invicara/ipa-core/modules/IpaUtils";

export const VIEW_SYSTEMS_KEY = 'viewSystems';
export const systemsAdapter = createEntityAdapter({
  //IDs are stored in a customized field ("_id")
  selectId: (system) => system._id,
  // Keep the "all IDs" array sorted based on names
  sortComparer: (a, b) => a['System Name'].localeCompare(b['System Name']),
});
let currentParallelFetchPromise = new Promise(res => res([]));
let currentAlertsParallelFetchPromise = new Promise(res => res([]));
const interceptFetchError = function(errorResult){
    console.error("Fetch failed",errorResult);
}
const getSystemIdsForEntityNextFetchPromise = (scriptName, entityInfo, entityType /*Asset or Space or Model Element*/) =>
    ScriptHelper.executeScript(scriptName, {entityInfo, entityType, modelInfo: {id: entityInfo[0].modelViewerIds[0]}}, undefined);
const getSystemsAsEntitiesNextFetchPromise = (scriptName, systemIds, entityInfo) =>
    ScriptHelper.executeScript(scriptName, {systemIds, entityInfo}, undefined);
const getAlertsForEntityDataMapNextFetchPromise = (scriptName, entityDataMap) =>
    ScriptHelper.executeScript(scriptName, {entityDataMap}, undefined);
export const getSystemElementFilterableProperty = (a, p) => {
    switch (p) {
        case "Entity Name" : {
            return a[p];
        }
        case "System Element Name" : {
            return a[p];
        }
        case "critical" : {
            return new String(a[p]).toString();
        }
        default : {
            return a.properties[p];
        }
    }
};
export const getFilteredSystemElementEntitiesBy = (entities, filters) => applyFilters(entities, filters, getSystemElementFilterableProperty);

export const fetchByEntityTypeAndId = createAsyncThunk(
  'fetchByEntityTypeAndId/fetchStatus',
  async (args, thunkAPI) => {
      const {entityInfo, entityType} = args;
      const state = thunkAPI.getState();
      const {getSystemIdsForEntity, getSystemsAsEntities} = state[VIEW_SYSTEMS_KEY].config.scripts;

      currentParallelFetchPromise = currentParallelFetchPromise
          .then(
              () => getSystemIdsForEntityNextFetchPromise(getSystemIdsForEntity, entityInfo, entityType),
              //ABOVE might return rejected promise, and chaining another .then is not possible without error handler resetting the promise status
              (errorResult) => { interceptFetchError(errorResult); return getSystemIdsForEntityNextFetchPromise(entityInfo, entityType);}
          )
          .then(
              (systemIds) => getSystemsAsEntitiesNextFetchPromise(getSystemsAsEntities, systemIds),
              //ABOVE might return rejected promise, and chaining another .then is not possible without error handler resetting the promise status
              (errorResult) => { interceptFetchError(errorResult); new Promise(res => res([]));}
          )


      let systemsAsEntities = await currentParallelFetchPromise;

      const sorted = _.sortBy(systemsAsEntities, a => a["Entity Name"]);
      return sorted;
  }
);
export const fetchAlertsBySystem = createAsyncThunk(
    'fetchAlertsBySystem/fetchStatus',
    async (args, thunkAPI) => {
        const {system} = args;
        const state = thunkAPI.getState();
        const {getSystemAlerts} = state[VIEW_SYSTEMS_KEY].config.scripts;
        const allowedTypes = ['Asset','Space'];
        console.log("fetchAlertsBySystem entityDataMap",system);
        const entityDataMap = system.elements
            .filter(element=>allowedTypes.includes(element.entityType))
            .map(element=>[element.entityType,element.entityInfo.map(entity=>entity._id)])
            .reduce((acc,[entityType,ids])=> {acc[entityType] = (acc[entityType] || []).concat(ids).flatMap(id=>id); return acc;},{});
        console.log("fetchAlertsBySystem entityDataMap",entityDataMap);
        currentAlertsParallelFetchPromise = currentAlertsParallelFetchPromise
            .then(
                () => getAlertsForEntityDataMapNextFetchPromise(getSystemAlerts, entityDataMap),
                //ABOVE might return rejected promise, and chaining another .then is not possible without error handler resetting the promise status
                (errorResult) => { interceptFetchError(errorResult); new Promise(res => res([]));}
            )


        let alerts = await currentAlertsParallelFetchPromise;
        return alerts;
    }
);
export const initialSystemsState = systemsAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  isolatedSystemElementEntities: [],
  appliedIsolationFilters : {},
  selectedSystemElementEntities: [],
  focusedSystemElementEntity: {},
  alertsLoadingStatus: 'nol loaded',
  alertsError: null,
  alerts: {},
  config: {
      scripts : {
          "getSystemIdsForEntity" : "getSystemIdsForEntity",
          "getSystemsAsEntities" : "getSystemsAsEntities",
          "getSystemAlerts" : "getSystemAlerts"
      }
  }
});
export const viewSystemsSlice = createSlice({
  name: VIEW_SYSTEMS_KEY,
  initialState: initialSystemsState,
  reducers: {
    //toolkit will add automatically actions on "viewSystemsActions" for these reducers
    setAll: systemsAdapter.setAll
    // ...
  },
  extraReducers: (builder) => {
    builder
        .addCase('updateConfig', (state, action) => {
            state.config = {...state.config, ...action.payload};
        })
        .addCase(fetchByEntityTypeAndId.pending, (state) => {
        state.loadingStatus = 'loading';
        })
        .addCase(fetchByEntityTypeAndId.fulfilled, (state, action) => {
        systemsAdapter.setAll(state, action.payload);
        state.loadingStatus = 'loaded';
        })
        .addCase(fetchByEntityTypeAndId.rejected, (state, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
        })
        .addCase('isolatedSystemElementEntities', (state, action) => {
          console.log("in isolatedSystemElementEntities",action);
          state.isolatedSystemElementEntities = action.payload;
        })
        .addCase('selectedSystemElementEntities', (state, action) => {
          console.log("in selectedSystemElementEntities",action);
          state.selectedSystemElementEntities = action.payload.map(se=>state.isolatedSystemElementEntities.find(ie => ie._id==se._id)).filter(e=>!!e);
        })
        .addCase('selectedSystemElementEntitiesFromIds', (state, action) => {
            console.log("in selectedSystemElementEntitiesFromIds",action);
            //first the ones that haven't changed
            const selectedUnchanged = action.payload.selected.map(id=>state.isolatedSystemElementEntities.find(ie => ie._id==id)).filter(e=>!!e && !action.payload.changed.includes(e._id));
            //then the ones that did, order is important
            const selectedChanged = action.payload.selected.map(id=>state.isolatedSystemElementEntities.find(ie => ie._id==id)).filter(e=>!!e && action.payload.changed.includes(e._id));
            state.selectedSystemElementEntities = selectedUnchanged.concat(selectedChanged);
        })
        .addCase('selectSystemElementsFromModels', (state, action) => {
          state.selectedSystemElementEntities = action.payload.map(modelEntity => state.isolatedSystemElementEntities.find(e => e.modelViewerIds.includes(modelEntity.id))).filter(e=>!!e);
        })
        .addCase('selectSystemElementsFromModelIds', (state, action) => {
            state.selectedSystemElementEntities = action.payload.map(modelId => state.isolatedSystemElementEntities.find(e => e.modelViewerIds.includes(modelId))).filter(e=>!!e);
        })
        .addCase('focusedSystemElementEntity', (state, action) => {
            const focusedSystemElementEntity = action.payload ? state.isolatedSystemElementEntities.find(e => e._id === action.payload._id) : undefined;
            state.focusedSystemElementEntity = focusedSystemElementEntity;
        })
        .addCase('clearAll', (state, action) => {
            systemsAdapter.removeAll(state);
            state.isolatedSystemElementEntities = [];
            state.selectedSystemElementEntities = [];
            state.alerts = {};
        })
        .addCase(fetchAlertsBySystem.pending, (state) => {
            state.alertsLoadingStatus = 'loading';
        })
        .addCase(fetchAlertsBySystem.fulfilled, (state, action) => {
            state.alerts = action.payload;
            state.alertsLoadingStatus = 'loaded';
        })
        .addCase(fetchAlertsBySystem.rejected, (state, action) => {
            state.alertsLoadingStatus = 'error';
            state.alertsError = action.error.message;
        })
        .addCase('setIsolationFilters' , (state, {payload: filters}) => {
          state.appliedIsolationFilters = filters
        });
  }
});
/*
 * Export reducer for store configuration.
 */
const viewSystemsReducer = viewSystemsSlice.reducer;
export default viewSystemsReducer;

export const viewSystemsActions = viewSystemsReducer.actions;

export const setIsolatedSystemElementEntities = (isolated) => ({
    type: "isolatedSystemElementEntities",
    payload: isolated
});
export const setSelectedSystemElementEntities = (selected) => ({
    type: "selectedSystemElementEntities",
    payload: selected
});
export const setSelectedSystemElementEntitiesFromIds = (selected,changed) => ({
    type: "selectedSystemElementEntitiesFromIds",
    payload: {selected,changed}
});
export const selectSystemElementsFromModels = (modelElements) => ({
    type: "selectSystemElementsFromModels",
    payload: modelElements
});
export const selectSystemElementsFromModelIds = (modelIds) => ({
    type: "selectSystemElementsFromModelIds",
    payload: modelIds
});
export const setFocusedSystemElementEntity = (focused) => ({
    type: "focusedSystemElementEntity",
    payload: focused
});
export const updateConfig = (config) => ({
    type: "updateConfig",
    payload: config
});
export const clearAll = () => ({
    type: "clearAll"
});
export const setIsolationFilters = (filters) => ({
    type: "setIsolationFilters",
    payload : filters
})

const { selectAll, selectEntities, selectById } = systemsAdapter.getSelectors();
export const getSystemsSlice = (rootState) => rootState[VIEW_SYSTEMS_KEY];
const getLoadingStatus = (slice) => slice.loadingStatus;
const getAlertsLoadingStatus = (slice) => slice.alertsLoadingStatus;
const getAlerts = (slice) => slice.alerts;
const getIsolatedSystemElementEntities = (slice) => slice.isolatedSystemElementEntities;
const getSelectedSystemElementEntities = (slice) => slice.selectedSystemElementEntities;
const getFocusedSystemElementEntity = (slice) => slice.focusedSystemElementEntity;
const getAppliedSystemElementIsolationFilters = (slice) => slice.appliedIsolationFilters;

export const selectNamedUserItemById = createSelector(
    getSystemsSlice,
    (state,id)=>id,
    selectById
);
export const selectAllSystems = createSelector(
    getSystemsSlice,
    selectAll
);
export const selectSystemEntitiesMap = createSelector(
    getSystemsSlice,
    selectEntities
);
export const selectSystemsLoadingStatus = createSelector(
    getSystemsSlice,
    getLoadingStatus
);

export const selectIsolatedSystemElementEntities = createSelector(
    getSystemsSlice,
    getIsolatedSystemElementEntities
);

export const selectAppliedSystemElementIsolationFilters = createSelector(
    getSystemsSlice,
    getAppliedSystemElementIsolationFilters
);

export const selectFilteredIsolatedSystemElementEntities = createSelector([selectIsolatedSystemElementEntities, selectAppliedSystemElementIsolationFilters], (isolatedSystemElementEntities, appliedFilters) => {
        return _.isEmpty(appliedFilters) ? isolatedSystemElementEntities: applyFilters(isolatedSystemElementEntities, appliedFilters, getSystemElementFilterableProperty);
    }
)
export const selectFilteredIsolatedSystemElementEntityIds = createSelector(
    [selectIsolatedSystemElementEntities, selectAppliedSystemElementIsolationFilters],
    (isolatedSystemElementEntities, appliedFilters) => {
        const filteredEntities = _.isEmpty(appliedFilters) ? isolatedSystemElementEntities: applyFilters(isolatedSystemElementEntities, appliedFilters, getSystemElementFilterableProperty);
        return filteredEntities.map(e=>e._id) ;
    }
)
export const selectHiddenIsolatedSystemElementEntities = createSelector(
    [selectIsolatedSystemElementEntities, selectFilteredIsolatedSystemElementEntityIds],
    (isolatedEntities, filteredEntityIds) => isolatedEntities.filter(e=>!filteredEntityIds.includes(e._id))
);
export const selectHiddenIsolatedSystemElementEntityIds = createSelector(
    [selectHiddenIsolatedSystemElementEntities],
    hiddenEntities => hiddenEntities.map(e=>e._id)
);

export const selectedSystemElementEntities = createSelector(
    getSystemsSlice,
    getSelectedSystemElementEntities
);

export const focusedSystemElementEntity = createSelector(
    getSystemsSlice,
    getFocusedSystemElementEntity
);

export const selectSystemsAlertsLoadingStatus = createSelector(
    getSystemsSlice,
    getAlertsLoadingStatus
);

export const selectSystemsAlerts = createSelector(
    getSystemsSlice,
    getAlerts
);

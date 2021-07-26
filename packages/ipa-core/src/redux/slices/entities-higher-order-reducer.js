import {createSelector, createSlice} from '@reduxjs/toolkit'
import ScriptHelper from "../../IpaUtils/ScriptHelper";
import {setIncludesBy} from "../../IpaUtils/compare";
import _ from "lodash";
import {parseNode, parseName} from "../../IpaControls/private/tree";
import {queryFromFilter} from "../../IpaControls/private/filter";
import {getEntityFromModel, getFilteredEntitiesBy} from "../../IpaUtils/entities";
import ScriptCache from "../../IpaUtils/script-cache";
import {ControlProvider} from "../../IpaControls/ControlProvider";


let initialState = {//TODO if operations on these entities get too slow, use direct access instead of an array
    currentEntityType: null,
    fetchingCurrent: 0,
    appliedFilters: {},
    selectingEntities: false,
    viewerSyncOn: false,
    allCurrent: [],
    selectedIds: [],
    isolatedIds: []
};

let currentFetchPromise = new Promise(res => res([]))

const mapIds = entities => entities.map(({_id}) => _id)

export const entitiesSliceFactory = (identifier = '') => {
    const sliceName = `entities${identifier}`
    const slice = createSlice({
        name: sliceName,
        initialState,
        reducers: {
            setEntities: (state, {payload: {entities, shouldIsolate = true}}) => {
                state.allCurrent = entities;
                //Whenever we fetch entities we want to isolate them unless specified otherwise.
                //Maybe this will change over time as requirements get more specific
                state.isolatedIds = shouldIsolate ? mapIds(entities) : []
            },
            setSelectedEntities: (state, {payload: entities}) => {
                state.selectedIds = mapIds(entities)
            },
            applyFiltering: (state, {payload: filters}) => {
                state.appliedFilters = filters
            },
            setFetching: (state, {payload: fetching}) => {
                if(fetching){
                    state.fetchingCurrent++;
                } else {
                    state.fetchingCurrent--;
                }
            },
            setSelecting: (state, {payload: selecting}) => {
                state.selectingEntities = selecting
            },
            setCurrentEntityType: (state, {payload: type}) => {
                state.currentEntityType = type
            },
            setViewerSyncOn: (state) => {
                state.viewerSyncOn = true
            },
            resetEntities: () => initialState,
            deleteEntity: (state, {payload: entity}) => {
                state.allCurrent.splice(state.allCurrent.findIndex(e => e._id === entity._id), 1)
            },
            addEntity: (state, {payload: entity}) => {
                state.allCurrent.push(entity)
            },
            updateEntity: (state, {payload: {_id, ...updates}}) => {
                const toUpdate = state.allCurrent.find(e => e._id === _id)
                _.assign(toUpdate, updates, {lastUpdate: Date.now()})
            },
            sortByName: (state) => {
                state.allCurrent.sort((a, b) => a["Entity Name"].localeCompare(b["Entity Name"]))
            },
            clearEntities: (state) => {
                state.allCurrent = [];
                state.appliedFilters = {}
                state.selectedIds = [];
                state.isolatedIds = []
            },
        },
    });

    const { actions, reducer } = slice;

    const actionCreators = actions;

    //Action creators
    const {
        setEntities, setFetching, resetEntities, setViewerSyncOn, setSelectedEntities, setCurrentEntityType, setSelecting,
        applyFiltering, addEntity, deleteEntity, updateEntity, clearEntities
    } = actionCreators

    //Private selectors
    const getEntitiesSlice = store => store[sliceName]

    const getIsolatedEntitiesIds = createSelector(getEntitiesSlice, entitiesSlice => entitiesSlice.isolatedIds || [])

    const getSelectedEntitiesIds = createSelector(getEntitiesSlice, entitiesSlice => entitiesSlice.selectedIds || [])

    const fromIDs = (entities, ids) => entities.filter(e => _.includes(ids, e._id))

    //Public Selectors
    const getAllCurrentEntities = createSelector(getEntitiesSlice, entitiesSlice => entitiesSlice.allCurrent)

    const getAppliedFilters = createSelector(getEntitiesSlice, entitiesSlice => entitiesSlice.appliedFilters)

    const getFilteredEntities = createSelector([getAllCurrentEntities, getAppliedFilters], (currentEntities, appliedFilters) =>
        _.isEmpty(getAppliedFilters) ? currentEntities : getFilteredEntitiesBy(currentEntities, appliedFilters)
    )

    const getIsolatedEntities = createSelector([getFilteredEntities, getIsolatedEntitiesIds], fromIDs)

    const getSelectedEntities = createSelector([getFilteredEntities, getSelectedEntitiesIds], fromIDs)

    const getFetchingCurrent = createSelector(getEntitiesSlice, entitiesSlice => !!entitiesSlice.fetchingCurrent)

    const isViewerSyncOn = createSelector(getEntitiesSlice, entitiesSlice => entitiesSlice.viewerSyncOn)

    const isSelectingEntities = createSelector(getEntitiesSlice, entitiesSlice => entitiesSlice.selectingEntities)

    const getCurrentEntityType = createSelector(getEntitiesSlice, entitiesSlice => entitiesSlice.currentEntityType)

    const selectors = {
        getAllCurrentEntities, getAppliedFilters,getFilteredEntities, getIsolatedEntities, getSelectedEntities,
        getFetchingCurrent, isViewerSyncOn, isSelectingEntities, getCurrentEntityType
    }

    //Thunks
    const selectEntitiesFromModels = (modelEntities) => async (dispatch, getState) => {
        try {
            dispatch(setSelecting(true))
            const {entityFromModelScript} = getCurrentEntityType(getState());
            const entitiesToSelect = await Promise.all(modelEntities.map(modelEntity => {
                const foundEntity = getAllCurrentEntities(getState()).find(e => modelEntity.id === e.modelViewerIds[0])
                return !_.isEmpty(foundEntity)  ? new Promise((resolve)=>resolve(foundEntity)) : getEntityFromModel(entityFromModelScript, modelEntity)
            }));
            const filteredToSelect = entitiesToSelect.filter(e => e)
            if (!setIncludesBy(getAllCurrentEntities(getState()), filteredToSelect, ({_id}) => _id))
                dispatch(setEntities({entities: filteredToSelect, shouldIsolate: false}))
            dispatch(setSelectedEntities(filteredToSelect))
            dispatch(setSelecting(false))
        } catch (e) {
            console.error("There was an error selecting the model entity:", e)
        }
    };

    const changeEntity = (changeType, entity) => async (dispatch, getState) => {
        const defaultChangeHandler = () => console.warn('Tried to edt entity with an unknown change type') //TODO Revisit if not doing anything is ok or we should be throwing an error.
        const entityChanges = {
            create: (entity) => dispatch(addEntity(entity)),
            edit: (entity) => dispatch(updateEntity(entity)),
            delete: (entity) => dispatch(deleteEntity(entity)),
            relate: (entity) => dispatch(updateEntity(entity))
        };
        (entityChanges[changeType] || defaultChangeHandler)(entity)
    }

    const fetchEntities = (script, selector, value) => async (dispatch, getState) => {
        const query = ControlProvider.getQuery(value, selector);
        dispatch(setFetching(true))
        currentFetchPromise = currentFetchPromise.then(() => query ?
            ScriptCache.runScript(selector.altScript ? selector.altScript : script, {entityInfo: selector.altScript ? value : query})
            : new Promise(res => res([]))
        )
        let entities = await currentFetchPromise;
        const sorted = _.sortBy(entities, a => a["Entity Name"]);
        dispatch(setEntities({entities: sorted}));
        dispatch(setSelectedEntities([]));
        // We do this to wait for the next tick thus allowing react to render the loading page-in between.
        // Otherwise when retrieving cached data it might happen so quickly that the loading page does not render and
        // the user has a few milliseconds while the page with updated data renders to execute a navigate action with stale data.
        // The real fix for this would be addressing the slow-render of the page, not a priority now.
        setTimeout( () => dispatch(setFetching(false)), 0)
    }

    const thunks = {
        selectEntitiesFromModels, changeEntity, fetchEntities
    }

    return {reducer, actionCreators, selectors, thunks}
}

//Other
const asOptional = (object, path) => _.isEmpty(_.get(object, path)) ? [] : [object];




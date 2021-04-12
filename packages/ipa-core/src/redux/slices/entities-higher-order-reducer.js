import {createSelector, createSlice} from '@reduxjs/toolkit'
import ScriptHelper from "../../IpaUtils/ScriptHelper";
import {setIncludesBy} from "../../IpaUtils/compare";
import _ from "lodash";
import {parseNode, parseName} from "../../IpaControls/private/tree";
import {queryFromFilter} from "../../IpaControls/private/filter";
import {getEntityFromModel, getFilteredEntitiesBy} from "../../IpaUtils/entities";


let initialState = {//TODO if operations on these entities get too slow, use direct access instead of an array
    currentEntityType: null,
    fetchingCurrent: false,
    appliedFilters: {},
    selectingEntities: false,
    viewerSyncOn: false,
    allCurrent: [],
    selectedIds: [],
    isolatedIds: []
};

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
                state.fetchingCurrent = fetching
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

    const getFetchingCurrent = createSelector(getEntitiesSlice, entitiesSlice => entitiesSlice.fetchingCurrent)

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
            const entitiesToSelect = await Promise.all(modelEntities.map(modelEntity => getEntityFromModel(entityFromModelScript, modelEntity)));
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
        const queryBuilder = {
            "<<TEXT_SEARCH>>": () => ({$text: {$search: value}}),
            "<<ADVANCED_SEARCH>>": () => queryFromFilter(value),
            "<<SCRIPTED_LINKED_SELECTS>>": () => getScriptedSelectQuery(selector, value),
            "<<TREE_SEARCH>>": () => getTreeSelectQuery(selector, value),
            "<<SCRIPTED_SELECTS>>": () => getScriptedSelectQuery(selector, value),
            "<<ID_SEARCH>>": () => ({_id: {$in: value}})
        }[selector.query];
        if (!queryBuilder) console.error("unknown selector query type:", selector.query);
        const query = queryBuilder()
        dispatch(setFetching(true))
        let entities = query ?
            await ScriptHelper.executeScript(selector.altScript ? selector.altScript : script, {entityInfo: selector.altScript ? value : query})
            : []
        entities.sort((a, b) => a["Entity Name"].localeCompare(b["Entity Name"]));
        dispatch(setEntities({entities}));
        dispatch(setSelectedEntities([]));
        dispatch(setFetching(false))
    }

    const thunks = {
        selectEntitiesFromModels, changeEntity, fetchEntities
    }

    return {reducer, actionCreators, selectors, thunks}
}

//Other
const asOptional = (object, path) => _.isEmpty(_.get(object, path)) ? [] : [object];

const getTreeSelectQuery = (selector, filteringNodes) => {
    const getQueryNodesFor = (nodeNames) => {
        return {
        "$or": _.values(_.pick(filteringNodes, nodeNames))
                .map(node => !node.isLeaf?
                    ({
                        "$and": [
                            { [`properties.${selector.treeLevels[node.level].property}.val`]: parseName(node.name).displayName },
                            ...asOptional(getQueryNodesFor(node.children), "$or")
                        ]
                    }) :
                    ({
                        [`properties.${selector.treeLevels[node.level].property}.val`]: parseName(node.name).displayName
                    })
                )
        }
    }

   return !_.isEmpty(filteringNodes) && getQueryNodesFor(_.keys(_.pickBy(_.mapValues(filteringNodes,parseNode), node => node.level === 0)));
}


const getScriptedSelectQuery = (selector, value) => {//TODO make this code cleaner
    let op = !!selector.op ? selector.op : "$and";
    let props = Object.keys(value);
    let hasMultiProps = props.length > 1;
    let query = {};
    if (hasMultiProps) {
        query[op] = props.map((prop) => {

            //check if the selectBy config provides the propName to query
            let selectConfig = _.find(selector.selects, {display: prop});

            let propName = selectConfig && selectConfig.propName ? selectConfig.propName : 'properties.' + prop + '.val';
            let qOption = {};
            if (value[prop].length > 0) {
                qOption[propName] = {$in: value[prop]};
            }
            return qOption
        });
    } else {
        //check if the selectBy config provides the propName to query
        let selectConfig = _.find(selector.selects, {display: props[0]});

        let propName = selectConfig && selectConfig.propName ? selectConfig.propName : 'properties.' + props[0] + '.val';
        query[propName] = {$in: value[props[0]]}
    }
    return query;
}



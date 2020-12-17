import { createSelector, createSlice} from '@reduxjs/toolkit'
import {getCurrentEntityType} from "./entities";
import _ from 'lodash';

import ScriptHelper from "../../IpaUtils/ScriptHelper";


let initialState = {//Using direct access instead of an array for better performance
    entitiesById: {},
    entityIds: [],
    relatedById: {},
    relations: [],
    fetching: false,
    entitiesChanged: false
};

const sameRelation = (relation, other) => relation.childId === other.childId && relation.parentId === other.parentId

const getRelation = (related, state, entityId) => related.isChild ?
        state.relations.find(r => sameRelation(r, {parentId: entityId, childId: related._id})) :
        state.relations.find(r => sameRelation(r, {parentId: related._id, childId: entityId}));

const entityRelationsSlice = createSlice({
    name: 'entityRelations',
    initialState,
    reducers: {
        setParentEntities: (state, { payload: entities }) => {
            state.entitiesChanged = false;
            state.entitiesById = entities.reduce((byIds, entity) => ({...byIds, [entity._id]: entity}), {});
            state.entityIds = entities.map(({_id}) => _id)
        },
        setRelatedEntities: (state, { payload: entities }) => {
            state.relatedById = entities.reduce((byIds, entity) => ({...byIds, [entity._id]: entity}), {});
        },
        setRelations: (state, { payload: relations }) => {
            state.relations = relations
        },
        setFetching: (state, { payload }) => {
            state.fetching = payload
        },
        addRelated: (state, { payload: {relatedType, related, entityIds} }) => {
            state.entitiesChanged = true;
            related.forEach(r => state.relatedById[r._id] = r)
            entityIds.forEach(entityId => {
                related.forEach(r => {
                    const newRelation = relatedType.isChild ?
                        {parentId: entityId, childId: r._id, new: true} : {parentId: r._id, childId: entityId, new: true}
                    if (!state.relations.some(r => sameRelation(r, newRelation))) state.relations.push(newRelation)
                })
            })
        },
        removeRelated: (state, { payload: {related, entityId} }) => {
            state.entitiesChanged = true;
            const relation = getRelation(related, state, entityId)
            if(relation.new){
                _.remove(state.relations,r =>  sameRelation(r, relation))
            } else {
                relation.removed = true;
            }
        },
        recoverRelated: (state, { payload: {related, entityId} }) => {
            state.entitiesChanged = true;
            const relation = getRelation(related, state, entityId)
            relation.removed = false;
        },
    },
});

const { actions, reducer } = entityRelationsSlice
export default reducer

//Private selectors
const getEntityRelationsSlice = store => store.entityRelations;


export const getEntityRelations = createSelector(getEntityRelationsSlice,
    relationSlice => relationSlice.relations
);

export const getAllEntities = createSelector(getEntityRelationsSlice,
    relationSlice => ({...relationSlice.entitiesById, ...relationSlice.relatedById})
);

//Public selectors
export const getParentEntities = createSelector(getEntityRelationsSlice,
    relationSlice => relationSlice.entityIds.map(id => ({
        ...relationSlice.entitiesById[id],
        related: relationSlice.relations
            .filter(({parentId, childId}) => parentId === id || childId === id)
            .map(({parentId, childId, new: isNew, removed}) => ({
                ...relationSlice.relatedById[ parentId === id ? childId : parentId],
                ...(parentId === id && {isChild: true}),
                ...(childId === id && {isParent: true}),
                new: isNew,
                removed
            })
        )
    }))
);

export const getFetchingRelatedEntities = createSelector(getEntityRelationsSlice,
    relationSlice => relationSlice.fetching
);

export const getEntitiesChanged = createSelector(getEntityRelationsSlice,
    relationSlice => relationSlice.entitiesChanged
);

//Action creators
export const {
    setParentEntities, setFetching, addRelated, removeRelated, recoverRelated, setRelatedEntities, setRelations
} = actions;

function getRelated(entity, relatedTypes) {
    const namesByType = ScriptHelper.getScriptVar("iaf_entityNamePropMap");
    const children = _.pick(entity, relatedTypes.map(ct => ct.singular));
    return _.values(_.mapValues(children, (childrenByType, type) =>
        childrenByType._list.map(child => ({ ...child, entityType: type, entityName: _.get(child, namesByType[type]) }))
    )).flat()
}

//Thunks
export const retrieveRelated = (originalParentEntities, getScript, relatedTypes) => async (dispatch, getState) => {
    dispatch(setFetching(true))
    const parentEntities = originalParentEntities.map(e => ({
        entityName: e["Entity Name"],
        entityType: getCurrentEntityType(getState()).singular,
        _id: e._id
    }));

    const rawEntitiesWithRelated =  await ScriptHelper.executeScript(getScript,{
            parentEntities,
            childrenTypes: relatedTypes
        });
    const related = rawEntitiesWithRelated.flatMap((entity) => getRelated(entity, relatedTypes));
    const relations = rawEntitiesWithRelated.flatMap((entity) =>
        getRelated(entity, relatedTypes).map(relatedEntity => relatedTypes.find(rt => rt.singular === relatedEntity.entityType).isChild ?
            {parentId: entity._id, childId: relatedEntity._id} : {parentId: relatedEntity._id, childId: entity._id}
        )
    );
    dispatch(setParentEntities(parentEntities))
    dispatch(setRelatedEntities(related))
    dispatch(setRelations(relations))
    dispatch(setFetching(false))
};

const getFilteredParentsWithChildren = (getState, predicate) => _.values(
    _.mapValues(_.groupBy(getEntityRelations(getState()).filter(predicate), r => r.parentId), (relations, parentId) =>
        ({
            ...getAllEntities(getState())[parentId],
            childrenMap: _.groupBy(relations.map(r => getAllEntities(getState())[r.childId]), c => c.entityType)
        })
    )
);


export const applyRelationChanges = (script, relatedTypes) => async (dispatch, getState) => {
    const parentEntitiesWithNewChildren = getFilteredParentsWithChildren(getState, relation => relation.new)
    const parentEntitiesWithDeletedChildren = getFilteredParentsWithChildren(getState, relation => relation.removed)
    const parentTypes = _.uniq([...parentEntitiesWithDeletedChildren, ...parentEntitiesWithNewChildren].map(pe => pe.entityType))
    await Promise.all([...relatedTypes, getCurrentEntityType(getState()).singular].map(
        childrenType => parentTypes.map(parentType => ScriptHelper.executeScript(script, {
                parentEntityType: parentType, //TODO Analyze some alternative to better group these complex lists and avoid so much filtering
                parentEntitiesWithNewChildren: parentEntitiesWithNewChildren.filter(p => p.entityType === parentType && !_.isEmpty(p.childrenMap[childrenType])),
                parentEntitiesWithDeletedChildren: parentEntitiesWithDeletedChildren.filter(p => p.entityType === parentType && !_.isEmpty(p.childrenMap[childrenType])),
                childrenEntityType: childrenType,
            })

        )
    ))
}


import React, {useEffect, useState} from "react";

import GenericMatButton from "../../IpaControls/GenericMatButton";
import {compose} from "redux";
import {connect} from "react-redux";
import {
    addRelated,
    applyRelationChanges,
    getEntitiesChanged,
    getFetchingRelatedEntities,
    getParentEntities, recoverRelated,
    removeRelated,
    retrieveRelated
} from "../../redux/slices/entity-relations";
import {getEntitySelectConfig} from "../../redux/slices/user-config";
import {
    applySearchFiltering,
    getAllCurrentSearchedEntities,
    getAppliedSearchFilters,
    getSearchingCurrent,
    getSelectedSearchedEntities,
    resetSearchedEntities,
    searchEntities,
    setSelectedSearchedEntities
} from "../../redux/slices/entities-pluggable-search";
import {useChecked} from "./EntityListView";
import {Overlay} from "./Overlay";
import {SummaryPanel} from "./SummaryPanel";
import {SearchPanel} from "./SearchPanel";
import {RelatePanel} from "./RelatePanel";
import _ from 'lodash';

import GenericModal from '../../IpaDialogs/GenericModal'

const RawRelationsModal = ({entity: originalParentEntities, action, parentEntities, retrieveRelated, close, entitySelectConfig,
                               fetchingRelated, searchEntities, searchedEntities, fetching, appliedFilters, selectedEntities,
                               resetSearchedEntities, addRelated, applyRelationChanges, removeRelated, entitiesChanged,
                               applySearchFiltering, setSelectedSearchedEntities, recoverRelated
}) => {
    const [selectedEntityType, setSelectedEntityType] = useState('');
    const {handleCheck, items: checkedEntities, resetChecked } = useChecked(parentEntities)
    const [overlay, setOverlay] = useState({show: false})

    useEffect(() => {
            //Since the modal gets reused and is not disposed of, we need to reset everything
            const originalEntitiesArray = Array.isArray(originalParentEntities) ? originalParentEntities : [originalParentEntities];
            setSelectedEntityType('');
            setOverlay({show: false});
            resetSearchedEntities()
            resetChecked(originalEntitiesArray);
            if (_.isEmpty(originalParentEntities)){
                setOverlay({show: true, duration: 3000, noFade: true, onFadeOut: close, content: <div>No entities selected</div>})
                return;
            }
            retrieveRelated(originalEntitiesArray, action.getScript, action.relatedTypes
            );
        },
        [retrieveRelated, originalParentEntities, action.getScript]
    );

    const doFetch = (...args) => {
        searchEntities(entitySelectConfig.find(e => e.entityName === selectedEntityType).script, ...args)
    }

    const handleSearchedEntityTypeChange = (selected) => {
        setSelectedEntityType(selected)
        resetSearchedEntities()
    };

    const relate = related => addRelated({
        entityIds: getCheckedEntities().filter(e => e.checked).map(p => p._id),
        relatedType: action.relatedTypes.find(rt => rt.singular === selectedEntityType),
        related: related.map(c => ({
            _id: c._id,
            entityName: c["Entity Name"],
            entityType: selectedEntityType
        }))
    })

    const applyChanges = async () => {
        setOverlay({show: true, content: <div>Updating relations...</div>})
        await applyRelationChanges(action.updateScript, action.relatedTypes.map(rt => rt.singular));
        setOverlay({show: true, duration: 2000, onFadeOut: close, content: <div>Relations successfully updated!</div>})
        
        //if the original entities were not an array, we were acting on a single entity
        //if so we need to update the entity by calling the actions success method to get
        //the entity to update in the UI
         setTimeout(() => {
                if (!Array.isArray(originalParentEntities)) action.onSuccess(action.type, originalParentEntities)
         }, 0) //For some reason if we do this synchronously, it messes up with the script. TODO: Find the root cause and remove the setTimeout
    }

    const cancel = () => {
        if(!entitiesChanged){
            close()
        } else {
            const content = <div>
                <div>There are unsaved changes. Are you sure you want to leave?</div>
                <div className={'buttons'}>
                    <GenericMatButton customClasses="cancel-button"
                                      onClick={close}>Close anyway</GenericMatButton>
                    <GenericMatButton customClasses="main-button"
                                      onClick={() => setOverlay({show: false})}>Keep editing</GenericMatButton>
                </div>
            </div>;
            setOverlay({show: true, onFadeOut: close, content})
        }
    }

    const getFromSelectedEntitySelectConfig = (path) => _.get(entitySelectConfig.find(e => e.entityName === selectedEntityType), path);

    const getCheckedEntities = () => parentEntities.map(p =>
        ({...p, checked: _.get(checkedEntities.find(c => c._id === p._id), 'checked', false)})
    );

    const handleCheckById = ({_id}) => handleCheck(checkedEntities.find(c => c._id === _id));

    return <GenericModal
        title={'Relate entities'}
        customClasses={'relations-modal'}
        noPadding noBackground
        modalBody={<div className={'relations-modal-body'}>
            <Overlay config={overlay}/>
            <div className={'panels'}>
                    <SummaryPanel parentEntities={parentEntities} checkedEntities={getCheckedEntities()}
                                  fetching={fetchingRelated} handleCheck={handleCheckById} entityTypeOptions={action.relatedTypes.map(rt => rt.singular)}
                                  removeRelated={removeRelated} recoverRelated={recoverRelated}/>
                <div className={'panel no-padding'}>
                    <SearchPanel onEntityTypeChange={handleSearchedEntityTypeChange} selectedEntityType={selectedEntityType}
                                 entityTypeOptions={entitySelectConfig.filter(e => action.relatedTypes.map(rt => rt.singular).includes(e.entityName)).map(e => e.entityName)}
                                 entityTypeSelectors={getFromSelectedEntitySelectConfig('selectors')}
                                 doFetch={doFetch} />
                </div>
                <div className={'panel no-padding'}>
                    <RelatePanel selectedEntityType={selectedEntityType} selectedEntities={selectedEntities}
                                 entityPlural={getFromSelectedEntitySelectConfig('entityPluralName')}
                                 appliedFilters={appliedFilters} fetching={fetching} searchedEntities={searchedEntities}
                                 parentEntities={parentEntities} checkedEntities={getCheckedEntities()} relate={relate}
                                 applySearchFiltering={applySearchFiltering} setSelectedSearchedEntities={setSelectedSearchedEntities}
                    />
                </div>
            </div>
            <div className={'buttons'}>
                <GenericMatButton customClasses="cancel-button" onClick={cancel}>Cancel</GenericMatButton>
                <GenericMatButton disabled={!entitiesChanged} customClasses="main-button" onClick={applyChanges}>Apply</GenericMatButton>
            </div>
        </div>}/>
}


const mapStateToProps = state => ({
    parentEntities: getParentEntities(state),
    entitySelectConfig: getEntitySelectConfig(state),
    searchedEntities: getAllCurrentSearchedEntities(state),
    fetching: getSearchingCurrent(state),
    appliedFilters: getAppliedSearchFilters(state),
    selectedEntities: getSelectedSearchedEntities(state),
    fetchingRelated: getFetchingRelatedEntities(state),
    entitiesChanged: getEntitiesChanged(state),
});

const mapDispatchToProps = {
    retrieveRelated,
    searchEntities,
    setSelectedSearchedEntities,
    applySearchFiltering,
    resetSearchedEntities,
    addRelated,
    applyRelationChanges,
    removeRelated,
    recoverRelated
}

export const RelationsModal = compose(
    connect(mapStateToProps, mapDispatchToProps),
)(RawRelationsModal)

export const RelationsModalFactory = {
    create: ({type, action, entity, context}) => {
        let modal = <RelationsModal action={action} entity={entity} type={type}
                                    close={() => context.ifefShowModal(false)} context={context}/>
        context.ifefShowModal(modal);
        return modal
    }
}
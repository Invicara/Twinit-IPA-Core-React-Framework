import React from "react";
import GenericMatButton from "../../IpaControls/GenericMatButton";
import EntitySelectionPanel, {TreeSelectMode} from "./EntitySelectionPanel"
import {branchNodeRenderer, leafNodeRenderer} from "../../IpaUtils/TreeRendererHelper"

export const RelatePanel = ({selectedEntityType, selectedEntities, checkedEntities, appliedFilters, fetching, entityPlural,
                         searchedEntities, parentEntities, relate, applySearchFiltering, setSelectedSearchedEntities
}) => {
    const RELATIONS_WARNING_MESSAGE = "This entity is related to: ";

    const getWarningMessage = (shouldDisplayWarning, entity) => {

        return shouldDisplayWarning ? RELATIONS_WARNING_MESSAGE + parentEntities.filter(p => p.related.some(r=> r._id === entity._id)).map((x) => x.entityName).join() : ""
    }

    const getEntitiesWithRelationsWarnings = () => {
        return searchedEntities.map((e) => ({...e, EntityWarningMessage: getWarningMessage(parentEntities.some(p => p.related.some(r=> r._id === e._id)), e)}))
    }

    return <>
        <div className={'panel-title'}>Relate</div>
        <div className='tree-container'>
            {selectedEntityType && <EntitySelectionPanel
                selectedGroups={undefined}
                selectedFilters={appliedFilters}
                selectedEntities={selectedEntities}
                fetching={fetching}
                entities={getEntitiesWithRelationsWarnings()}
                onSelect={(entities) => setSelectedSearchedEntities(entities)}
                treeSelectMode={TreeSelectMode.NONE_MEANS_NONE}
                onGroupOrFilterChange={(changes) => applySearchFiltering(changes.filters)}
                leafNodeRenderer={leafNodeRenderer}
                branchNodeRenderer={branchNodeRenderer}
                name={selectedEntityType + "_selection_panel"}
                entitySingular={selectedEntityType}
                entityPlural={entityPlural}
            />}
        </div>
        <div className={'add-button-container'}>
            <GenericMatButton disabled={checkedEntities.every(e => !e.checked) || _.isEmpty(selectedEntities)}
                              customClasses="add-button" onClick={() => relate(selectedEntities)}>
                Add
            </GenericMatButton>
        </div></>
}

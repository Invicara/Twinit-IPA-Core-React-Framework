import React from "react";
import EnhancedFetchControl from "../../IpaControls/EnhancedFetchControl"
import SimpleSelect from "../../IpaControls/SimpleSelect"

export const SearchPanel = ({onEntityTypeChange, selectedEntityType, entityTypeOptions, entityTypeSelectors = [], doFetch}) => {
    return <>
        <div className={'panel-title'}>Search</div>
        <SimpleSelect
            className={'entity-select'}
            placeholder={`Select an Entity Type to relate to`}
            options={entityTypeOptions}
            handleChange={onEntityTypeChange}
            value={selectedEntityType}
        />

        {selectedEntityType && <div className={'inner-panel'}>
            <EnhancedFetchControl
                selectors={entityTypeSelectors}
                doFetch={doFetch}
            />
        </div>}
    </>
}
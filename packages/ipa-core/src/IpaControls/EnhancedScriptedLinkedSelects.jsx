import React, {Fragment, useEffect, useState} from "react";
import Select, { highlightOptions } from "./Select";
import {FetchButton} from "./FetchButton";
import clsx from "clsx";
import _ from "lodash";
import {loadPlainInitialValueWithScriptedSelectFormat} from "../IpaUtils/ScriptedSelectsHelpers";
import ScriptCache from "../IpaUtils/script-cache";
import { useWithLinkedSelectChange } from "./private/useWithLinkedSelectChange";
import {asSelectOptions} from "../IpaUtils/controls";

const flattenIfNotMulti = (selectValues, selects) => {//This is necessary bc script helper does not handle single-option select values as a list
    return _.mapValues(selectValues, (selectedOptions, selectId) =>
        selects[selectId].multi ? selectedOptions : selectedOptions[0]
    )
};

export const ScriptedLinkedSelects = ({currentValue, onChange, disabled, touched, noFetch, onFetch, selects: selectsConfig, compact, horizontal, selectOverrideStyles, highlightedOptions, placeholders, isClearable = true}) => {

    const [selects, setSelects] = useState(selectsConfig.reduce((acc, select, i) => ({
        ...acc,
        [select.display]: {...select, index: i, options: []}
    }), {}));

    const value = (currentValue || {})
    
    useEffect(() => {
        updateFetchOptions();
    }, [currentValue]);

    const getSelectedValue = option => {
        return option.value
    }
    
    const updateFetchOptions = async () => {
        let newSelects = await fetchOptions(selects);
        if (currentValue) {

          let selectKeys = Object.keys(selects);
          let previousSelectValues = {};
          for (let i = 1; i < selectKeys.length; i++) {
            if (currentValue?.[selectKeys?.[i-1]]?.length > 0) {              
              previousSelectValues[selectKeys[i-1]] = currentValue[selectKeys[i-1]];
              newSelects = await fetchOptions(newSelects, selects[selectKeys[i-1]], previousSelectValues);
            }
            else break;

          }

        }
    }

    const fetchOptions = async (selects, currentSelect, previousSelectsValues) => {
        const nextSelect = _.values(selects)[currentSelect ? currentSelect.index + 1 : 0]
        let newSelects;
        if (nextSelect) {                       
            let selectOptions = await ScriptCache.runScript(nextSelect.script,
                previousSelectsValues ? {input: flattenIfNotMulti(previousSelectsValues, selects)} : undefined
            );  

            selectOptions = selectOptions || [];

            newSelects = {
                ...selects,
                [nextSelect.display]: {...nextSelect, options: selectOptions.sort((a, b) => a.localeCompare(b))}
            }

            setSelects(newSelects)
        }
        loadPlainInitialValueWithScriptedSelectFormat(onChange, currentValue, selects);
        return newSelects;
    };

    const [onLinkedSelectChange] = useWithLinkedSelectChange(selects, setSelects, value, getSelectedValue, onChange, fetchOptions);

    const fetchDisabled = !value || _.isEmpty(_.values(value).flatMap(_.identity));

    return <div className={clsx("scripted-selects-control", compact && 'compact', horizontal && 'horizontal')}>
        {_.values(_.mapValues(selects, (select, selectId) => {
            const selectValue = _.compact(value[selectId])
            
            let selectOptions = _.compact(asSelectOptions(select.options))
            if(highlightedOptions?.[selectId]) {
                selectOptions =  highlightOptions(highlightedOptions[selectId], selectOptions)
            }

            const placeholder = placeholders?.[selectId];

            return <Fragment key={selectId}>
                <Select
                    labelProps={compact ? undefined : {text: selectId}}
                    isMulti={select.multi}
                    styles={selectOverrideStyles}
                    value={asSelectOptions(selectValue)}
                    onChange={selected => onLinkedSelectChange(selectId, selected, select)}
                    options={selectOptions}
                    placeholder={placeholder}
                    closeMenuOnSelect={!select.multi}
                    isClearable
                    required={select.required}
                    isDisabled={_.isEmpty(select.options) || disabled}
                    menuPlacement="auto"
                    menuPosition="fixed"
                />
            </Fragment>
        }))}
        {!noFetch && <FetchButton disabled={fetchDisabled} onClick={onFetch}
                     customClasses={touched && !fetchDisabled && 'attention'}>Fetch</FetchButton>}
    </div>
};

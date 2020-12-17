import React, {Fragment, useEffect, useState} from "react";
import Select from "react-select";
import {asSelectOptions, selectStyles} from "./EnhancedScriptedSelects";
import {FetchButton} from "./FetchButton";
import clsx from "clsx";
import _ from "lodash";
import {loadPlainInitialValueWithScriptedSelectFormat} from "../IpaUtils/ScriptedSelectsHelpers";
import ScriptCache from "../IpaUtils/script-cache";

const flattenIfNotMulti = (selectValues, selects) => {//This is necessary bc script helper does not handle single-option select values as a list
    return _.mapValues(selectValues, (selectedOptions, selectId) =>
        selects[selectId].multi ? selectedOptions : selectedOptions[0]
    )
};

export const ScriptedLinkedSelects = ({currentValue, onChange, disabled, touched, noFetch, onFetch, selects: selectsConfig, compact, selectOverrideStyles, isClearable = true}) => {

    const [selects, setSelects] = useState(selectsConfig.reduce((acc, select, i) => ({
        ...acc,
        [select.display]: {...select, index: i, options: []}
    }), {}));

    const value = (currentValue || {})

    useEffect(() => {
        updateFetchOptions();
    }, []);
    
    useEffect(() => {
        updateFetchOptions();
    }, [currentValue]);
    
    const updateFetchOptions = () => {
      fetchOptions();

        if (currentValue) {

          let selectKeys = Object.keys(selects);
          let previousSelectValues = {};
          for (let i = 1; i < selectKeys.length; i++) {

            if (currentValue[selectKeys[i]] && currentValue[selectKeys[i]].length) {              
              previousSelectValues[selectKeys[i-1]] = currentValue[selectKeys[i-1]];
              fetchOptions(selects[selectKeys[i-1]], previousSelectValues);
            }
            else break;

          }

        }
    }

    const fetchOptions = async (currentSelect, previousSelectsValues) => {
        const nextSelect = _.values(selects)[currentSelect ? currentSelect.index + 1 : 0]
        if (nextSelect) {                       
            const selectOptions = await ScriptCache.runScript(nextSelect.script,
                previousSelectsValues ? {input: flattenIfNotMulti(previousSelectsValues, selects)} : undefined
            );            
            setSelects(selects => ({
                ...selects,
                [nextSelect.display]: {...nextSelect, options: selectOptions.sort((a, b) => a.localeCompare(b))}
            }))
        }
        loadPlainInitialValueWithScriptedSelectFormat(onChange, currentValue, selects);
    };

    const getSubsequentSelects = select => {
        return _.values(selects).slice(select.index + 1).reduce((acc, select) => ({
            ...acc,
            [select.display]: select
        }), {});
    };

    const clearSelectsOptions = selectsToBeCleared => {
        const clearedSelects = _.mapValues(selectsToBeCleared, select  => ({...select, options: []}));
        setSelects(selects => ({...selects, ...clearedSelects}));
    };

    const handleChange = (selectId, selectedOption, select) => {
        const selectedValues = selectedOption ? (select.multi ? selectedOption : [selectedOption]).map(opt => opt.value) : [];
        const newValue = {...value, [selectId]: selectedValues};
        const subsequentSelects = getSubsequentSelects(select);
        onChange({...newValue, ..._.mapValues(subsequentSelects, () => [])})
        clearSelectsOptions(subsequentSelects)
        if(selectedOption){
            fetchOptions(select, newValue)
        }
    };

    const fetchDisabled = !value || _.isEmpty(_.values(value).flatMap(_.identity));

    return <div className={clsx("scripted-selects-control", compact && 'compact')}>
        {_.values(_.mapValues(selects, (select, selectId) => <Fragment key={selectId}>
            {!compact && <span className={clsx("select-title", select.required && "required")}>{selectId}</span>}
                <Select
                    styles={selectOverrideStyles || {control: selectStyles}}
                    isMulti={select.multi}
                    value={value[selectId] ? asSelectOptions(value[selectId]) : []}
                    onChange={selected => handleChange(selectId, selected, select)}
                    options={asSelectOptions(select.options)}
                    className="select-element"
                    closeMenuOnSelect={!select.multi}
                    isClearable={isClearable}
                    placeholder={`Select a ${selectId}`}
                    isDisabled={_.isEmpty(select.options) || disabled}
                    menuPlacement="auto"
                    menuPosition="fixed"
                />
            </Fragment>
        ))}
        {!noFetch && <FetchButton disabled={fetchDisabled} onClick={onFetch}
                     customClasses={touched && !fetchDisabled && 'attention'}>Fetch</FetchButton>}
    </div>
};

import React, {Fragment, useEffect, useState} from "react";
import Select, { highlightOptions } from "./Select";
import {FetchButton} from "./FetchButton";
import clsx from "clsx";
import _ from "lodash";
import {loadPlainInitialValueWithScriptedSelectFormat} from "../IpaUtils/ScriptedSelectsHelpers";
import {asSelectOptions} from "../IpaUtils/controls";

import ScriptCache from "../IpaUtils/script-cache";

import './EnhancedScriptedSelects.scss'

export const ScriptedSelects = ({currentValue, onChange, touched, noFetch, compact, horizontal, selectOverrideStyles, onFetch, multi, placeholder, highlightedOptions, isClearable, script, disabled}) => {
    const [selects, setSelects] = useState({});

    const value = (currentValue || {})

    useEffect(() => {
        const fetchOptions = async () => {
            setSelects({});
            const selectOptions = await ScriptCache.runScript(script);
            setSelects(_.mapValues(selectOptions, options => options?.sort((a, b) => a.localeCompare(b))))
            loadPlainInitialValueWithScriptedSelectFormat(onChange, value, selectOptions);
        };
        fetchOptions();
    }, [script]);

    const handleChange = (selectId, selected) => {

        let selectedValues;
        if (!selected || (Array.isArray(selected) && !selected.length)) {
            let newValue = {...value, [selectId]: []}
            onChange(newValue)
        }
        else {
          selectedValues = selected ? (multi ? selected : [selected]).map(opt => opt.value) : [];
          onChange({...value, [selectId]: selectedValues})
        }
    };

    return _.isEmpty(selects) ? 'Loading controls...\n' :
        <div className={clsx("scripted-selects-control", compact && 'compact', horizontal && 'horizontal')}>
            {_.values(_.mapValues(selects, (options, selectId) => {
                const selectValue = _.compact(value[selectId])
                let selectOptions = _.compact(asSelectOptions(options))
                selectOptions = highlightOptions(highlightedOptions, selectOptions)
                return <Fragment key={selectId}>
                    <Select
                        labelProps={compact ? undefined : {text: selectId}}
                        isMulti={multi}
                        value={asSelectOptions(selectValue)}
                        onChange={selected => handleChange(selectId, selected)}
                        options={selectOptions}
                        closeMenuOnSelect={!multi}
                        styles={selectOverrideStyles}
                        isClearable={isClearable}
                        placeholder={placeholder}
                        isDisabled={_.isEmpty(options) || disabled}
                        menuPlacement="auto"
                        menuPosition="fixed"
                    />
                </Fragment>
            }))}
            {!noFetch && <FetchButton disabled={disabled} onClick={onFetch}
                         customClasses={touched && !disabled && 'attention'}>Fetch</FetchButton>}
        </div>
};

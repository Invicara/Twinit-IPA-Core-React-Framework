import React, {Fragment, useEffect, useState} from "react";
import Select from "react-select";
import {FetchButton} from "./FetchButton";
import clsx from "clsx";
import _ from "lodash";
import {loadPlainInitialValueWithScriptedSelectFormat} from "../IpaUtils/ScriptedSelectsHelpers";
import {asSelectOptions} from "../IpaUtils/controls";

import ScriptCache from "../IpaUtils/script-cache";

import './EnhancedScriptedSelects.scss'
import {selectStyles} from "./private/selectStyles";

export const ScriptedSelects = ({currentValue, onChange, touched, noFetch, compact, selectOverrideStyles, onFetch, multi, script, disabled}) => {
    const [selects, setSelects] = useState({});

    const value = (currentValue || {})

    useEffect(() => {
        const fetchOptions = async () => {
            setSelects({});
            const selectOptions = await ScriptCache.runScript(script);
            setSelects(_.mapValues(selectOptions, options => options.sort((a, b) => a.localeCompare(b))))
            loadPlainInitialValueWithScriptedSelectFormat(onChange, currentValue, selectOptions);
        };
        fetchOptions();
    }, [script]);

    const handleChange = (selectId, selected) => {

        let selectedValues;
        if (!selected || (Array.isArray(selected) && !selected.length)) {
          delete value[selectId]
          onChange({...value})
        }
        else {
          selectedValues = selected ? (multi ? selected : [selected]).map(opt => opt.value) : [];
          onChange({...value, [selectId]: selectedValues})
        }
    };

    return _.isEmpty(selects) ? 'Loading controls...\n' :
        <div className={clsx("scripted-selects-control", compact && 'compact', horizontal && 'horizontal')}>
            {_.values(_.mapValues(selects, (options, selectId) => <Fragment key={selectId}>
                    {!compact && <span className="select-title">{selectId}</span>}
                    <Select
                        styles={selectOverrideStyles || {control: selectStyles}}
                        isMulti={multi}
                        value={value[selectId] ? asSelectOptions(value[selectId]) : null}
                        onChange={selected => handleChange(selectId, selected)}
                        options={asSelectOptions(options)}
                        className="select-element"
                        closeMenuOnSelect={!multi}
                        isClearable={true}
                        placeholder={`Select a ${selectId}`}
                        isDisabled={_.isEmpty(options) || disabled}
                        menuPlacement="auto"
                        menuPosition="fixed"
                    />
                </Fragment>
            ))}
            {!noFetch && <FetchButton disabled={disabled} onClick={onFetch}
                         customClasses={touched && !disabled && 'attention'}>Fetch</FetchButton>}
        </div>
};

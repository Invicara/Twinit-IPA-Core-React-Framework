import React, {Fragment, useEffect, useRef, useState} from "react";
import CreatableSelect from "react-select/creatable";
import clsx from "clsx";
import _ from "lodash"
import {usePrevious} from "../IpaUtils/usePrevious";

import ScriptCache from "../IpaUtils/script-cache";
import {loadPlainInitialValueWithScriptedSelectFormat} from '../IpaUtils/ScriptedSelectsHelpers'
import {asSelectOptions} from "../IpaUtils/controls";
import {selectStyles} from "./private/selectStyles";

export const CreatableScriptedSelects = ({currentValue, onChange, multi, script, disabled, filterInfo, compact, horizontal, selectOverrideStyles, isClearable = true, reloadTrigger}) => {
    const [selects, setSelects] = useState({});
    const {current: debouncedScriptExecutor} = useRef(_.debounce(ScriptCache.runScript, 1000, {leading: true, trailing: true}));
    const prevFilterInfo = usePrevious(filterInfo)

    const value = (currentValue || {})

    const fetchOptions = async (filterInfo) => {
      const selectOptions = filterInfo ? await debouncedScriptExecutor(script, {filterInfo: filterInfo}) : await ScriptCache.runScript(script);
      setSelects(_.mapValues(selectOptions, options => options.sort((a, b) => a.localeCompare(b))))
      loadPlainInitialValueWithScriptedSelectFormat(onChange, currentValue, selectOptions);
    };

    useEffect(() => {
        fetchOptions();
    }, []);
    
    useEffect(() => {
        fetchOptions();
    }, [reloadTrigger]);
    
     useEffect(() => {
         if (filterInfo && !_.isEqual(filterInfo, prevFilterInfo))
          fetchOptions(filterInfo);
    }, [filterInfo]);

    const handleChange = (selectId, selected) => {//FIXME remove duplication - Maybe create a hook?

        let selectedValues;
        if (!selected || (Array.isArray(selected) && !selected.length)) {
          delete value[selectId]
          onChange({...value})
        }
        else {
          //check if a new value has been added and add it to the options
          if (selected.__isNew__) {
            let tempSelects = _.cloneDeep(selects)
            tempSelects[selectId].push(selected.value)
            tempSelects[selectId].sort((a, b) => a.localeCompare(b))
            setSelects(tempSelects)
          }
        
          selectedValues = selected ? (multi ? selected : [selected]).map(opt => opt.value) : [];
          onChange({...value, [selectId]: selectedValues})
        }
    };

    return _.isEmpty(selects) ? 'Loading controls...\n' :
        <div className={clsx("scripted-selects-control", compact && 'compact', horizontal && 'horizontal')}>
            {_.values(_.mapValues(selects, (options, selectId) => <Fragment key={selectId}>
                {!compact && <span className="select-title">{selectId}</span>}
                    <CreatableSelect
                        styles={selectOverrideStyles || {control: selectStyles}}
                        isMulti={multi}
                        value={value[selectId] ? asSelectOptions(value[selectId]) : null}
                        onChange={selected => handleChange(selectId, selected)}
                        options={asSelectOptions(options)}
                        className="select-element"
                        closeMenuOnSelect={!multi}
                        isClearable={isClearable}
                        placeholder={`Select a ${selectId}`}
                        menuPlacement="auto"
                        menuPosition="fixed"
                        isDisabled={disabled}
                    />
                </Fragment>
            ))}
        </div>
};

import React, {Fragment, useEffect, useState} from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import clsx from "clsx";
import _ from "lodash";
import {loadPlainInitialValueWithScriptedSelectFormat} from '../IpaUtils/ScriptedSelectsHelpers'
import ScriptCache from "../IpaUtils/script-cache";
import { useWithLinkedSelectChange } from "./private/useWithLinkedSelectChange";
import {asSelectOptions} from "../IpaUtils/controls";
import {selectStyles} from "./private/selectStyles";

export const EnhancedPickListSelect = ({currentValue, onChange, disabled, selects: selectsConfig, compact, selectOverrideStyles, isClearable = true, pickListScript, initialPickListType, canCreateItems, updateScript}) => {

    const [selects, setSelects] = useState(selectsConfig.reduce((acc, select, i) => ({
        ...acc,
        [select.display]: {display: select.display, index: i, options: [], createPickListOnUpdate: select.createPickListOnUpdate && canCreateItems}
    }), {}));    

    const value = (currentValue || {})

    const getSelectedValue = option => {
        return {value:option.value, display: option.label}
    }

    const fetchOptions = async (currentSelect, currentSelectValue) => {
        const nextSelect = _.values(selects)[currentSelect ? currentSelect.index + 1 : 0]
        if (nextSelect) {
            const selectOptions = await ScriptCache.runScript(pickListScript,
                {type: currentSelect ? currentSelectValue[currentSelect.display][0].value : initialPickListType}
            );            
            setSelects(selects => ({
                ...selects,
                [nextSelect.display]: {...nextSelect, type: selectOptions[0].type, options: selectOptions[0].values.sort((a, b) => a.display.localeCompare(b.display))}
            }))
        }
        loadPlainInitialValueWithScriptedSelectFormat(onChange, currentValue, selects);
    };

    const [onLinkedSelectChange] = useWithLinkedSelectChange(selects, setSelects, value, getSelectedValue, onChange, fetchOptions);
    
    useEffect(() => {        
        updateFetchOptions();
    }, [currentValue]);
    
    const updateFetchOptions = () => {      
      fetchOptions();

        if (currentValue) {
            let selectKeys = Object.keys(selects);
            Promise.all(selectKeys.filter(k => currentValue[k] && currentValue[k].length).map(selectKey => {
                fetchOptions(selects[selectKey], currentValue);
              }))          
        }      
    }    

    const updatePickList = async (select, displayValue, optionValue) => {
        let scriptArgs = {type: select.type, newValue: {display: displayValue, value: optionValue }};
        if(select.createPickListOnUpdate){
            scriptArgs = {...scriptArgs, newType: optionValue}
        }
        const updateResult = await ScriptCache.runScript(updateScript, scriptArgs);
        return updateResult;
    }

    const refreshParentPickListCachedResult = async (selectId) => {
        const index = selects[selectId].index;
        let parentPickListType = initialPickListType;
        if (index > 0) {
	        let parentPickList = Object.entries(selects).filter(e => e[1].index === index -1).map(s => s[0]);
            parentPickListType = value[parentPickList[0]][0].value;            
        }
        await ScriptCache.runScript(pickListScript,
            {type: parentPickListType}, {ignoreCachedScriptResult: true}
        );
    }

    const parentHasValue = (selectId) => {
        const index = selects[selectId].index;
        if (index === 0) return true;
        let parentPickList = Object.entries(selects).filter(e => e[1].index === index -1).map(s => s[0]);
        return value[parentPickList[0]] && value[parentPickList[0]].length;        
    }

    const handleCreatableChange = (selectId, selected, select) => {
        if (selected && selected.__isNew__) {
            let tempSelects = _.cloneDeep(selects)
            const newSelectValue = select.createPickListOnUpdate ? selected.value + select.type : selected.value
            tempSelects[selectId].options.push({display: selected.value, value: newSelectValue})
            tempSelects[selectId].options.sort((a, b) => a.display.localeCompare(b.display))
            setSelects(tempSelects)
            updatePickList(select, selected.value, newSelectValue)
            refreshParentPickListCachedResult(selectId)
            onLinkedSelectChange(selectId, {label: selected.value, value: newSelectValue}, selects[selectId]);
          }else {
            onLinkedSelectChange(selectId, selected, selects[selectId]);
        }        
    };

    return <div className={clsx("scripted-selects-control", compact && 'compact')}>
        {_.values(_.mapValues(selects, (select, selectId) => <Fragment key={selectId}>
            {!compact && <span className={clsx("select-title", select.required && "required")}>{selectId}</span>}
                {!canCreateItems && <Select
                    styles={selectOverrideStyles || {control: selectStyles}}
                    isMulti={false}
                    value={value[selectId] ? asSelectOptions(value[selectId]) : []}
                    onChange={selected => onLinkedSelectChange(selectId, selected, select)}
                    options={asSelectOptions(select.options)}
                    className="select-element"
                    closeMenuOnSelect={true}
                    isClearable={isClearable}
                    placeholder={`Select a ${selectId}`}
                    isDisabled={_.isEmpty(select.options) || disabled}
                    menuPlacement="auto"
                    menuPosition="fixed"
                />}
                {canCreateItems && <CreatableSelect
                        styles={selectOverrideStyles || {control: selectStyles}}
                        isMulti={false}
                        value={value[selectId] ? asSelectOptions(value[selectId]) : null}
                        onChange={selected => handleCreatableChange(selectId, selected, select)}
                        options={asSelectOptions(select.options)}
                        className="select-element"
                        closeMenuOnSelect={true}
                        isClearable={isClearable}
                        placeholder={`Select a ${selectId}`}
                        menuPlacement="auto"
                        menuPosition="fixed"
                        isDisabled={disabled || !parentHasValue(selectId)}
                    />}
            </Fragment>
        ))}        
    </div>
};

import Select from "react-select";
import React, {useEffect, useRef} from "react";
import GenericMatButton from "../../IpaControls/GenericMatButton";
import clsx from "clsx";
import _ from 'lodash'
import {asSelectOption, asSelectOptions} from "../../IpaUtils/controls";

export const fileSelectStyles = {
    control: (provided, {isFocused, isDisabled}) => ({
        backgroundColor: isDisabled ? "hsl(0, 0%, 95%)" : "hsl(0, 0%, 100%)",
        border: `none`,
        display: 'flex',
        minWidth: '200px'
    }),
    indicatorSeparator: () => ({
        display: 'none'
    })
};

export const Star = () => <span className="required-mark">*</span>

export const FileTableSelect = ({options = [], onChange, value}) => <Select
    styles={fileSelectStyles}
    isMulti={false}
    value={value && asSelectOption(value)}
    onChange={(e) => onChange(e?.value)}
    options={asSelectOptions(options)}
    className="select-element"
    closeMenuOnSelect={true}
    placeholder={`Choose`}
    isDisabled={false}
    menuPlacement="auto"
    menuPosition="fixed"
    isClearable={true}
/>

//This component has a delayed onChange to avoid hitting the store too often
//If this approach complicates matters at some point alternatives are:
//a) Make fully controlled and hit the store on every stroke, maybe performance is ok anyways
//b) Move table state management to UploadWizardObject either via common state variables (+immer) or `useReducer` hook
export const FileTableInput = ({onChange, initialValue = ''}) => {
    const input = useRef();
    useEffect(() => {input.current.value = initialValue}, [input, initialValue])
    const onChangeDebounced = _.debounce(onChange, 350)
    return <input ref={input} className={'file-table-input'} onChange={e => onChangeDebounced(e.target.value)}/>
}

export const PanelToggle = ({onClick, disabled}) => {
    return <div className={clsx('panel-toggle', disabled && 'disabled')} onClick={disabled ? _.noop : onClick}>
        <i className={`fas fa-cloud-upload-alt cloud-icon`}/>
    </div>
}

export const WizardButtons = (originalOptions) => ({optionsOverride}) => {
    const options = {...originalOptions, ...optionsOverride}

    return <div className={'file-wizard-actions'}>
        {_.get(options, 'hidePrimary') || <GenericMatButton customClasses="main-button"
                                                            disabled={_.get(options, 'primaryDisabled', false)}
                                                            onClick={_.get(options, 'onPrimaryClick', _.noop)}>
            {_.get(options, 'primaryContent', 'Next')}
        </GenericMatButton>}
        {_.get(options, 'hideSecondary') || <GenericMatButton customClasses="cancel-button"
                                                              disabled={_.get(options, 'secondaryDisabled', false)}
                                                              onClick={_.get(options, 'onSecondaryClick', _.noop)}>
            {_.get(options, 'secondaryContent', 'Previous')}
        </GenericMatButton>}
    </div>
}

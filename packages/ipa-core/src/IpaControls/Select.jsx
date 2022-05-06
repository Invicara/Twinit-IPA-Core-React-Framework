import React from 'react'
import {default as ReactSelect} from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { selectStyles } from './private/selectStyles'
import clsx from "clsx";
import _, { functionsIn } from 'lodash';

import './Select.scss'
import ControlLabel from './ControlLabel';
import {any, array, bool, func, object, shape, string} from 'prop-types'


const Select = props => {

  let Component = props.creatable ? CreatableSelect : ReactSelect

  let optionStyle = (styles, { data }) => {
    return {
      ...styles,
      color: data.highlight ? 'var(--app-accent-color)' : styles.color
    }
  };


  return (
    <div className='ipa-select'>
      {props.labelProps && (
        <ControlLabel {...props.labelProps} required={props.required}/>
      )}
      <Component
        styles={{
          control: selectStyles,
          option: optionStyle,
          ...props.styles
        }}
        isMulti={props.isMulti}
        value={props.value}
        onChange={props.onChange}
        options={props.options}
        classNamePrefix='ipa-select'
        className='select-element'
        closeMenuOnSelect={props.closeMenuOnSelect}
        isClearable={props.isClearable}
        placeholder={props.placeholder || props.label && `Select a ${props.label}`}
        isDisabled={props.isDisabled}
        menuPlacement={props.menuPlacement}
        menuPosition={props.menuPosition}
      />
    </div>
  )
}

export const highlightOptions = (keysToHighlight, options) => options.map((option) => ({
        ...option,
        highlight: _.defaultTo(keysToHighlight, []).includes(option.key.trim())
}))

Select.propTypes = {
  labelProps: shape({...ControlLabel.propTypes}),
  creatable: bool,
  isMulti: bool,
  value: any,
  onChange: func,
  options: array,
  closeMenuOnSelect: func,
  isClearable: bool,
  placeholder: string,
  label: string,
  isDisabled: bool,
  menuPlacement: string,
  menuPosition: string,
  styles: object
}


export default Select

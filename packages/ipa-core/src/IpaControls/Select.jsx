import React from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { selectStyles } from './private/selectStyles'
import clsx from "clsx";
import _ from 'lodash';

import './Select.scss'
import ControlLabel from './ControlLabel';
import {shape} from 'prop-types'


const IpaSelect = props => {

  let Component = props.creatable ? CreatableSelect : Select

  let optionStyle = (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      color: data.highlight ? 'var(--app-accent-color)' : styles.color
    }
  };


  return (
    <div className='ipa-select'>
      {props.labelProps && (
        <ControlLabel {...props.labelProps}/>
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
        highlight: _.defaultTo(keysToHighlight, []).includes(option.key)
}))

IpaSelect.propTypes = {
  labelProps: shape({...ControlLabel.propTypes}),
  ...Select.propTypes,
  ...CreatableSelect.propTypes
}


export default IpaSelect

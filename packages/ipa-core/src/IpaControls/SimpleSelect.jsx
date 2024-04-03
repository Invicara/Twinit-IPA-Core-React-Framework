import React from "react";
import Select from 'react-select'

const SimpleSelect = ({title, options, handleChange, placeholder, className, value, clearable = true, disabled}) => {
  return (
      <div className={className}>
          {title && <span className="simple-select-title">{title}</span>}
        <Select
            value={value && {label: value, value}}
            isMulti={false}                        
            onChange={selected => handleChange(selected && selected.value)}
            options={options.map(s =>  ({label: s, value: s}))}
            className="simple-select-element"
            closeMenuOnSelect={true}                        
            placeholder={placeholder}
            isClearable={clearable}
            isDisabled={disabled}
        /> 
      </div>      
  )
}
export default SimpleSelect;

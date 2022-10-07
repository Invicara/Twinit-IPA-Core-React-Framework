/**
 * ****************************************************************************
 *
 * INVICARA INC CONFIDENTIAL __________________
 *
 * Copyright (C) [2012] - [2019] INVICARA INC, INVICARA Pte Ltd, INVICARA INDIA
 * PVT LTD All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains the property of
 * Invicara Inc and its suppliers, if any. The intellectual and technical
 * concepts contained herein are proprietary to Invicara Inc and its suppliers
 * and may be covered by U.S. and Foreign Patents, patents in process, and are
 * protected by trade secret or copyright law. Dissemination of this information
 * or reproduction of this material is strictly forbidden unless prior written
 * permission is obtained from Invicara Inc.
 */

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

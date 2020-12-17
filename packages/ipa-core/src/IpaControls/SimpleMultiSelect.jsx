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

const SimpleMultiSelect = ({propName, available, selections, update}) => {

  let selected = selections.slice(0)
  let options = available.filter(v => selected.indexOf(v) < 0).map(v => <option key={v}>{v}</option>)
  options.unshift(<option key="_none">{ selected.length==0 ? "Choose a value..." : "Choose another value..."}</option>)
  let select = <select onChange={e=>{selectionAdded(e)}}>{options}</select>

  const selectionAdded = (e) => {
    selected.push(e.target.value)
    update(propName, selected)
  }

  const selectionRemoved = (v) => {
    selected = selected.filter(vv => vv!=v)
    update(propName, selected)
  }

  let i=0
  return (
    <div className="filter-multi-select">
      { selections.map(v =>
        <div key={"filter-multi-selet"+i++}
          className="filter-multi-select-value"
          onClick={e => selectionRemoved(v)}
          >
          {v}
        </div>)}
      {select}
    </div>
  )
}
export default SimpleMultiSelect;

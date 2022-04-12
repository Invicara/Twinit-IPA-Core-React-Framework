import React, {useState} from "react";
import Select from 'react-select';

const GroupControl = ({selected, styles, groups, onChange}) => {

  const [value, setValue] = useState(selected || [])

  const _onChange = (selections) => {

    if (selections) {
      onChange(selections.map(o => o.value))
      setValue(selections.map(o => o.value))
    }
    else {
      onChange([])
      setValue([])
    }
  }
  return (
    <Select
      onChange={_onChange}
      styles={styles}
      placeholder='Select group'
      options={groups.map(g => {return {label: g, value: g}})}
      value={selected ? selected.map(s => { return {value: s, label: s} }) : value.map(s => { return {value: s, label: s} })}
      isMulti isClearable isSearchable/>
  )
}

export default React.memo(GroupControl)

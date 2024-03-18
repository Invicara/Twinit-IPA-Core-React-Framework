import React, { useState} from "react";
import {FetchButton} from "./FetchButton";
import FilterControl from "./FilterControl";
import {FILTER2OP} from "./private/filter";



const FILTER_SELECT_STYLES = {
    control: styles => ({...styles, width: '100%', margin: '10px 0'}),
    container: styles => ({...styles, display: 'block', width: '100%'})
};

export const AdvancedSearch = (props) => {
    let {currentValue, onChange, touched, onFetch, display} = props

    let [filters, setFilters] = useState(currentValue ? currentValue.fitlers : {})
    let [includeAll, setIncludeAll] = useState(currentValue ? currentValue.includeAll : true)
    let [ignoreCase, setIgnoreCase] = useState(currentValue ? currentValue.ignoreCase : true)

    const onChangeFilters = (newFilters) => {
      setFilters(newFilters)
      onChange({filters: newFilters, includeAll, ignoreCase})
    }

    const onChangeAll = ({target: {checked}}) => {
      setIncludeAll(checked)
      onChange({filters, includeAll: checked, ignoreCase})
    }

    const onChangeCase = ({target: {checked}}) => {
      setIgnoreCase(checked)
      onChange({filters, includeAll, ignoreCase: checked})
    }

    let disabled = !currentValue || !currentValue.filters || Object.keys(currentValue.filters).length==0

    return <div className="advanced-search text-search">
        <span className="title">{display}</span>
        <FilterControl className="entities-filter"
                       styles={FILTER_SELECT_STYLES}
                       onChange={onChangeFilters}
                       filters={filters}
                       placeholder="Choose search terms"
                       availableOperators={Object.keys(FILTER2OP)}
                       availableFilters={props.searchable}/>
        <span>
          <input type="checkbox" onChange={onChangeCase} checked={ignoreCase}/>
          <label>Ignore Case</label>
        </span>
        <span>
          <input type="checkbox" onChange={onChangeAll} checked={includeAll}/>
          <label>Must include all search terms</label>
        </span>
        <FetchButton disabled={disabled} onClick={onFetch}
               customClasses={touched && !disabled && 'attention'}>Search</FetchButton>
    </div>
};

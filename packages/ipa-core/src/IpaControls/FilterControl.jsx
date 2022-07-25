import React from "react";
import _ from "lodash"
import Select from 'react-select';
import enhanceWithClickOutside from 'react-click-outside'
import DatePicker from 'react-date-picker';
import DateTimePicker from 'react-datetime-picker';
import {produce} from "immer";

import GenericMatButton from "./GenericMatButton"
import {getRandomString} from "../IpaUtils/helpers"
import AdvSearchQueryBuilder from "../IpaUtils/AdvSearchQueryBuilder"

import './FilterControl.scss'

const FUNCTIONS = [

  // these funcs take any type from a pick list of unique actual values
  {name: "equals", input: "single-pick", types: "*",
    test: (propVal, filterVal) => propVal===filterVal },
  {name: "in", input: "multi-pick", types: "*",
    test: (propVal, filterVal) => filterVal.indexOf(propVal) >= 0 },
  {name: "does not equal", input: "single-pick", types: "*",
    test: (propVal, filterVal) => propVal!==filterVal },
  {name: "is not in", input: "multi-pick",  types: "*",
    test: (propVal, filterVal) => filterVal.indexOf(propVal) < 0 },

  // these funcs take text input - all comparisons are case insensitive
  {name: "starts with", input: "text", types: "|text|",
    test: (propVal, filterVal) => propVal.toLowerCase().startsWith(filterVal.toLowerCase()) },
  {name: "ends with", input: "text", types: "|text|",
    test: (propVal, filterVal) => propVal.toLowerCase().endsWith(filterVal.toLowerCase()) },
  {name: "contains", input: "text", types: "|text|",
    test: (propVal, filterVal) => propVal.toLowerCase().indexOf(filterVal.toLowerCase()) >= 0},
  {name: "does not start with", input: "text", types: "|text|",
    test: (propVal, filterVal) => !propVal.toLowerCase().startsWith(filterVal.toLowerCase()) },
  {name: "does not end with", input: "text", types: "|text|",
    test: (propVal, filterVal) => !propVal.toLowerCase().endsWith(filterVal.toLowerCase()) },
  {name: "does not contain", input: "text", types: "|text|",
    test: (propVal, filterVal) => propVal.toLowerCase().indexOf(filterVal.toLowerCase()) < 0 },

  // these funcs take one or two numeric or date or datetime inputs
  {name: "less than", input: "single", types: "|number|date|datetime|",
    test: (propVal, filterVal) => propVal < filterVal },
  {name: "less than or equal to", input: "single", types: "|number|date|datetime|",
    test: (propVal, filterVal) => propVal <= filterVal},
  {name: "greater than", input: "single", types: "|number|date|datetime|",
    test: (propVal, filterVal) => propVal > filterVal},
  {name: "greater than or equal to", input: "single", types: "|number|date|datetime|",
    test: (propVal, filterVal) => propVal >= filterVal},
  {name: "between", input: "range", types: "|number|date|datetime|",
    test: (propVal, filterVal) => propVal >= filterVal.from && propVal <= filterVal.to},
  {name: "outside of", input: "range", types: "|number|date|datetime|",
    test: (propVal, filterVal) => propVal < filterVal.from || propVal > filterVal.to},

]

const isNumericOp = (op) => {
  return (
    // op == "equals" ||
    // op == "does not equal" ||
    op == "less than" ||
    op == "less than or equal to" ||
    op == "greater than" ||
    op == "greater than or equal to" ||
    op == "between" ||
    op == "outside of"
  )
}

const getFormattedDateFromTimestamp = (ts, type) => {
  let d = new Date(ts)
  if (type=="dateTime")
    return d.toLocaleString()
  else
    return d.toLocaleDateString()
}

class FilterControl extends React.Component {

  state = {
    filters: Object.assign({}, this.props.filters),
    completeFilters: Object.assign({}, this.props.filters),
    key: getRandomString("filter-")
  }

  onFilterChange = (filters) => {
    this.setState({filters})
    let allFilters = Object.keys(filters)
    let completeFilters = Object.assign({}, filters)
    allFilters.forEach((f) => {
      if (!completeFilters[f].value)
        delete completeFilters[f]
    })
    this.setState({completeFilters})
    this.props.onChange(completeFilters)
  }

  componentDidUpdate(prevProps){
    if(!_.isEqual(prevProps.filters, this.props.filters)){
      this.onFilterChange(this.props.filters)
    }
  }

  handleClickOutside = () => {
    document.querySelector(".filter-drop-down-panel."+this.state.key).classList.add("hidden")
  }

  render() {
    return (
      <div className={this.props.className=="assets-filter" ? "assets-filter-container" : "filter-container"}>
        <CurrentFilters
          placeholder={this.props.placeholder}
          parentKey={this.state.key}
          filters={this.state.completeFilters}
          onChange={this.onFilterChange}/>
        <FilterDropDownPanel
          parentKey={this.state.key}
          styles={this.props.styles}
          filters={this.state.filters}
          available={this.props.availableFilters}
          functions={this.props.availableOperators}
          onChange={this.onFilterChange}/>
      </div>
    )
  }
}

const CurrentFilters = ({placeholder, parentKey,filters, onChange}) => {

  const togglePanel = () => {
    document.querySelector(".filter-drop-down-panel."+parentKey).classList.toggle("hidden")
  }

  const clearFilters = (e) => {
    e.stopPropagation();
    document.querySelector(".filter-drop-down-panel."+parentKey).classList.add("hidden")
    if (Object.keys(filters).length != 0)
      onChange({})
  }

  const removeFilter = (e,key) => {
    e.stopPropagation()
    let newFilters = JSON.parse(JSON.stringify(filters))
    delete newFilters[key]
    onChange(newFilters)
  }

  let filterList = Object.entries(filters).map(([key,f]) => {
    let val = Array.isArray(f.value) ? f.value.join(",") : f.value
    if (f.type == "date"|| f.type == "datetime") {
      if (typeof(val.to) != 'undefined') {
        val = `${getFormattedDateFromTimestamp(val.from,f.type)} and ${getFormattedDateFromTimestamp(val.to,f.type)}`
      }
      else {
        val = getFormattedDateFromTimestamp(val,f.type)
      }
    }
    else if (typeof(val.to) != 'undefined') {
      val = `${val.from} and ${val.to}`
    }
    return (
      <div key={"applied-filter-"+key} className="filter-multi-select-value" >
        {key} {f.op} {val}
        <i className="fas fa-times" style={{marginLeft: '8px'}} onClick={(e)=>removeFilter(e,key)}></i>
      </div>
    )
  })

  return (
    <div className="control" onClick={togglePanel}>
      <div>{filterList.length?
        filterList :
        <div className="placeholder">{placeholder || "Choose filters"}</div>}
      </div>
      <div className="buttons">
          <svg onClick={clearFilters} height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" >
            <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697
              0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697
              0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469
              0.469 1.229 0 1.698z">
            </path>
          </svg>
        <div>
          <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436
              0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502
              0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z">
            </path>
          </svg>
        </div>
      </div>
    </div>
  )
}

class FilterDropDownPanel extends React.Component {

  defaultState = {
    selectedProperty: null,
    selectedFunction: null,
    selectedValue: null,
    availableFunctions: null,
    isReady: false
  }

  constructor(props) {
    super(props)
    this.state = this.defaultState
  }

  hide = (el) =>  {
    while (!el.classList.contains(this.props.parentKey))
      el = el.parentElement
    el.classList.add('hidden')
    this.setState(this.defaultState)
  }

  cancel = (e) => {
    this.hide(e.target)
  }

  add = (e) => {
    const filters = produce(this.props.filters, filters => {
        let filter = filters[this.state.selectedProperty] || {}
        let type =
        filter.op = this.state.selectedFunction
        filter.value = this.state.selectedValue
        filter.type = this.props.available[this.state.selectedProperty].type
        filters[this.state.selectedProperty] = filter
    })
    this.props.onChange(filters)
    this.hide(e.target)
  }

  propertyChanged = (v) => {
    let selection = v ? v.value : null
    let filter = this.props.filters[selection]

    if (filter) {
      this.setState({
        selectedProperty: selection,
        selectedFunction: filter.op,
        selectedValue: filter.value,
        availableFunctions: this.getAvailableFunctions(selection),
        isReady: true
      })
    }
    else {
      this.setState({
        selectedProperty: selection,
        selectedFunction: null,
        selectedValue: null,
        availableFunctions: this.getAvailableFunctions(selection),
        isReady: false
      })
    }
  }

  functionChanged = (v) => {
    let selection = v ? v.value : null
    this.setState({
      selectedFunction: selection,
      selectedValue: null,
      isReady: false
    })
  }

  listValueChanged = (v) => {
    let selection = !v ? "" : v.value
    this.setState({
      selectedValue: selection,
      isReady: selection != ""
    })
  }

  multiListValueChanged = (v) => {
    let selection = !v ? "" : v.map(vv => vv.value)
    this.setState({
      selectedValue: selection,
      isReady: selection != ""
    })
  }

  inputValueChanged = (e) => {
    let input = e.target.value
    this.setState({
      selectedValue: input,
      isReady: input != ""
    })
  }

  rangeChanged = (input, field) => {
    let selectedValue = _.cloneDeep(this.state.selectedValue)
    let num = parseFloat(input)
    if (_.isObject(selectedValue))
      selectedValue[field] = num
    else {
      selectedValue = {}
      selectedValue[field] = num
    }
    
    let ready = false;
    if (_.isNumber(selectedValue.from) && _.isNumber(selectedValue.to)){
      ready = true
      if (selectedValue.from > selectedValue.to) {
        let tempValue = selectedValue.to
        selectedValue.to = selectedValue.from
        selectedValue.from = tempValue
      }
    }
        
    this.setState({
      selectedValue,
      isReady: ready
    })
  }

  dateChanged = (input) => {
    this.setState({
      selectedValue: !!input ? input.getTime() : null,
      isReady: !!input
    })
  }

  dateRangeChanged = (input, field) => {
    let selectedValue = _.cloneDeep(this.state.selectedValue)
    if (_.isObject(selectedValue))
      selectedValue[field] = !!input ? input.getTime() : null
    else {
      selectedValue = {}
      selectedValue[field] = !!input ? input.getTime() : null
    }
    
    let ready = false;
    if (_.isNumber(selectedValue.from) && _.isNumber(selectedValue.to)){
      ready = true
      if (selectedValue.from > selectedValue.to) {
        let tempValue = selectedValue.to
        selectedValue.to = selectedValue.from
        selectedValue.from = tempValue
      }
    }
    
    this.setState({
      selectedValue,
      isReady: ready
    })
  }

  hasValues = (prop) => prop.values && prop.values.length


  getAvailableFunctions = (selectedProperty) => {
    if (!selectedProperty) return []
    let hasValues = this.hasValues(this.props.available[selectedProperty])
    let type = "|" + this.props.available[selectedProperty].type + "|"
    return FUNCTIONS
      .filter(f => !this.props.functions || this.props.functions.includes(f.name))
      .filter(f => f.types=="*" || f.types.indexOf(type)>=0 )
      .filter(f => hasValues || !f.input.indexOf("pick")>=0 )
      .map(f => { return {value: f.name, label: f.name}})
  }

  getAvailableValues = (selectedFunction) => {
    let hasValues = this.hasValues(this.props.available[this.state.selectedProperty])
    if (Array.isArray(this.props.available[this.state.selectedProperty]))
    {
      return this.props.available[this.state.selectedProperty].map(
        v => {return {value: v, label: v}}
      )
    }
    else if (hasValues)
    {
      return this.props.available[this.state.selectedProperty].values.map(
        v => {return {value: v, label: v}}
      )
    }
  }

  getDateControl = (type, range) => {

    let value
    if (range==false)
      value = this.state.selectedValue ? new Date(this.state.selectedValue) : null
    else {
      value = {}
      value.from = this.state.selectedValue && this.state.selectedValue.from ? new Date(this.state.selectedValue.from) : null
      value.to = this.state.selectedValue && this.state.selectedValue.to ? new Date(this.state.selectedValue.to) : null
    }

    if (type=='date') {
      if (range==false) {
        return (
          <DatePicker
            onChange={this.dateChanged}
            value={value}
            calendarIcon={null}
          />
        )
      }
      else {
        return (
          <span className="range">
            <label>From</label>
            <DatePicker
              onChange={e => this.dateRangeChanged(e, "from")}
              value={value.from}
              calendarIcon={null}
            />
            <label>To</label>
            <DatePicker
              onChange={e => this.dateRangeChanged(e, "to")}
              value={value.to}
              calendarIcon={null}
            />
          </span>
        )
      }
    }
    else if (type=="datetime") {
      if (range==false) {
        return (
          <DateTimePicker
            onChange={this.dateChanged}
            value={value}
            calendarIcon={null}
          />
        )
      }
      else {
        return (
          <span className="range">
            <label>From</label>
            <DateTimePicker
              onChange={e => this.dateRangeChanged(e, "from")}
              value={value.from}
              calendarIcon={null}
              disableClock={true}
            />
            <label>To</label>
            <DateTimePicker
              onChange={e => this.dateRangeChanged(e, "to")}
              value={value.to}
              calendarIcon={null}
              disableClock={true}
            />
          </span>
        )
      }
    }
    return null
  }

  getInputControl = () => {
    let func = FUNCTIONS.find(f => f.name == this.state.selectedFunction)

    if (!func) return null

    let type = this.props.available[this.state.selectedProperty].type
    let hasValues = this.hasValues(this.props.available[this.state.selectedProperty])
    let textControl = (<input
      onChange={this.inputValueChanged}
      value={this.state.selectedValue ? this.state.selectedValue : ""}
      placeholder="Enter Value"
      className="filter-input-value" />)
    let numberControl = (<input
      type="number"
      onChange={this.inputValueChanged}
      value={this.state.selectedValue ? this.state.selectedValue : ""}
      placeholder="Enter Value"
      className="filter-input-value" />)

    let noValueControl
    if (func.input=='single-pick') {
      if (type=="date" || type=="datetime") noValueControl = this.getDateControl(type, false)
      else if (type=="number")              noValueControl = numberControl
      else                                  noValueControl = textControl
    }

    switch (func.input) {
      case 'single-pick':
        return (hasValues ? <Select
          onChange={this.listValueChanged}
          styles={this.props.styles}
          placeholder='Select Value'
          options={this.getAvailableValues()}
          value={this.state.selectedValue ? {value: this.state.selectedValue, label: this.state.selectedValue} : null}
          disabled={!this.state.selectedProperty}
          menuPlacement="auto"
          menuPosition="fixed"
          isSearchable isClearable/> : noValueControl)
        break;
      case 'multi-pick':
        return (hasValues ? <Select
          onChange={this.multiListValueChanged}
          styles={this.props.styles}
          placeholder='Select Value'
          options={this.getAvailableValues()}
          value={this.state.selectedValue ? this.state.selectedValue.map(v => {return {value: v, label: v}}) : null}
          disabled={!this.state.selectedProperty}
          menuPlacement="auto"
          menuPosition="fixed"
          isMulti isSearchable isClearable/> : noValueControl)
        break;
      case 'text':
        return textControl
        break;
      case 'single':
        if (type=="date" || type=="datetime") {
          return this.getDateControl(type, false)
        }
        else {
          return numberControl
        }
        break;
      case 'range':
        if (type=="date" || type=="datetime") {
          return this.getDateControl(type, true)
        }
        else {
          return (
            <span className="range">
              <label>From</label>
              <input
                type="number"
                onChange={e=>this.rangeChanged(e.target.value, "from")}
                value={this.state.selectedValue && this.state.selectedValue.from !== undefined ? this.state.selectedValue.from : ""}
                placeholder="from"
                className="filter-input-value" />
              <label>To</label>
              <input
                type="number"
                onChange={e=>this.rangeChanged(e.target.value, "to")}
                value={this.state.selectedValue && this.state.selectedValue.from !== undefined ? this.state.selectedValue.to : ""}
                placeholder="to"
                className="filter-input-value" />
            </span>
          )
        }
        break;
      default:
        console.error("Unknown input for ", func)
        return <div>Unknown data type! ({func.input})</div>
    }
  }

  render() {
    let properties = Object.keys(this.props.available)
          .sort().map(a => {return {label:a+(this.props.filters[a] ? " *" : ""), value:a}})

    return (
      <div className={"hidden filter-drop-down-panel "+this.props.parentKey}>
        <div>
          <Select
            onChange={this.propertyChanged}
            styles={this.props.styles}
            value={ this.state.selectedProperty ? {value: this.state.selectedProperty, label: this.state.selectedProperty} : null}
            placeholder='Select Property'
            options={properties}
            menuPlacement="auto"
            menuPosition="fixed"
            isSearchable isClearable/>
        </div>
        <div>
          <Select
            onChange={this.functionChanged}
            styles={this.props.styles}
            placeholder='Select Function'
            options={this.state.availableFunctions}
            value={this.state.selectedFunction ? {value: this.state.selectedFunction, label: this.state.selectedFunction} : null}
            disabled={!this.state.availableFunctions}
            menuPlacement="auto"
            menuPosition="fixed"
            isSearchable isClearable/>
        </div>
        <div>
          { this.getInputControl() }
        </div>
        <GenericMatButton
          onClick={this.cancel}>
          Cancel
        </GenericMatButton>
        <GenericMatButton
          disabled={!this.state.isReady}
          onClick={this.add}>
          Add
        </GenericMatButton>
      </div>
    )
  }
}


export const applyFilters = (array, filters, getProperty) => {
  let result = [...array]
  if (!_.isEmpty(filters)) {
    Object.entries(filters).forEach(([filterProp, filter]) => {
      result = result.filter(a => {
        let prop = getProperty(a, filterProp)
        let propVal
        if (_.isString(prop) || prop === undefined) {
          propVal = prop
        }
        else {
          propVal = prop.val
          if (prop.type=="date" || prop.type=="datetime") {
            if (isNumericOp(filter.op)) {
              propVal = prop.epoch
            }
          }
        }
        if (!propVal) {
          if (filter.value=="_empty_" && (filter.op=="equals" || filter.op=="in"))
            return true;
          if (filter.value!="_empty_" && (filter.op.startsWith("does not") || filter.op=="is not in"))
            return true;
          else
            return false;
        }
        let f = FUNCTIONS.find(f => f.name == filter.op)
        if (!f) {
          console.error("no implementation for filter operator: "+filter.op)
          return true;
        }
        else
          return f.test(propVal, filter.value)
      })
    })
  }
  return result
}

export default enhanceWithClickOutside(FilterControl)

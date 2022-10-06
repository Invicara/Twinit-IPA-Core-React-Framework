import React, { useState } from 'react'
import Table from '../Table/Table'
import BaseTextInput from "../BaseTextInput";
import './AlertTable.scss'
import { Tooltip } from '@material-ui/core';
import withPageNavigation from '../../IpaPageComponents/withPageNavigation';

const getHeaders = columns => {
  let headers = columns.filter(c => c.active === true).map(c => c.name)
  headers.push('')
  return headers
}

const URGENCY_CLASSNAMES = {
  "High": "cell--urgency cell--urgency-high",
  "Medium": "cell--urgency cell--urgency-medium",
  "Low": "cell--urgency cell--urgency-low",
}

const getRowFromAlert = (alert, activeColumns, navigationConfig, onNavigate) => {
  console.log('getRowFromAlert alert', alert)
  console.log('getRowFromAlert activeColumns', activeColumns)
  const row = activeColumns.map(c => {
    let className = undefined;
    let property = _.get(alert, c.accessor);
    if(property.dname === "Urgency") {
      className = URGENCY_CLASSNAMES[property.val];
    }
    return {..._.get(alert, c.accessor), className}
  })
  console.log('getRowFromAlert row', row)

  //TODO create and push the action menu
  row.push({
    type: "action", 
    val: <Tooltip key="cell-tooltip" title="Navigate to Source" enterDelay={500}>
      <button 
        className='alert-table__row-action-button'
        onClick={() => {
          console.log("button onClick alert", alert);
          console.log("button onClick navigationConfig", navigationConfig);
          if(alert.Source !== null) {
            const entityType = alert.Source.entityType
            const selectedEntities = alert.Source.entities.map(e => e._id);

            let query = {
              entityType,
              selectedEntities,
              senderEntityType: entityType,
              query: {value: selectedEntities}
            }
            console.log("button onClick query", query);
            onNavigate(navigationConfig[entityType], query)
          }
          
          }}
      >
        <i className="fa fa-arrow-right" aria-hidden="true"></i>
      </button>
    </Tooltip>, 
    className: "alert-table__row-action"
  })

  return row
}

const getRowsFromAlerts = (alerts, columns, navigationConfig, onNavigate) => {
  let activeColumns = columns.filter(c => c.active === true)

  let rows = alerts.map(a => getRowFromAlert(a, activeColumns, navigationConfig, onNavigate))

  return rows
}

const AlertTable = (props) => {
  console.log('AlertTable props', props)
  const [filterInput, setFilterInput] = useState(null);

  return (
    <div className='alert-table'>
      <h1 className='alert-table__title'>{props.title}</h1>
      <div className='alert-table__body'>
        <div className='alert-table__filter'>
          <label className='alert-table__filter-label'>Filter By: </label>
          <BaseTextInput className="alert-table__filter-input" inputProps={{
              disabled: true,
              type: "text",
              value: filterInput,
              onChange: (e) => setFilterInput(e.target.value)
            }}
          />
          <button disabled={true} className={`alert-table__filter-button alert-table__filter-button--disabled `}><i className="fa fa-sliders"></i></button>
        </div>
        <Table
          className="alert-table__table"
          headers={getHeaders(props.columns)}
          rows={getRowsFromAlerts(props.alerts, props.columns, props.navigateTo, props.onNavigate)}
          options={{ emptyMessage: 'No data', emptyMessageClassName: 'alert-table__empty-message' }}
        />
      </div>
    </div>
  )
}

export default withPageNavigation(AlertTable)

/**
 * ****************************************************************************
 *
 * INVICARA INC CONFIDENTIAL __________________
 *
 * Copyright (C) [2012] - [2020] INVICARA INC, INVICARA Pte Ltd, INVICARA INDIA
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
import _ from 'lodash'
import EntityDataStack from "./EntityDataStack"
import EntityActionsPanel from "./EntityActionsPanel"
import SimpleTextThrobber from "../../IpaControls/SimpleTextThrobber"

import '../../IpaStyles/DbmTooltip.scss'
import './EntityDetailPanel.scss'


class EntityDetailPanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedDataGroups: new Set()
    }
  }

  componentDidMount() {

    Object.keys(this.props.config.data).forEach((name) => {
      if (this.props.config.data[name].selected) this.dataGroupSelected(name, true);
    });

  }

  dataGroupSelected = (name, selected) => {
    // make a keyed name so we can retain display order
    let index = Object.keys(this.props.config.data).findIndex(n => n==name) + 1
    let keyedName = `${(index/100).toFixed(2)}${name}` // make it one based and divide by 100 so all keys are the same length
    //let selectedDataGroups = new Set([...this.state.selectedDataGroups]) removed as creating a new set everytime was causing a race condition
    let {selectedDataGroups} = this.state;
    if (selected) selectedDataGroups.add(keyedName)
    else          selectedDataGroups.delete(keyedName)
    this.setState({selectedDataGroups})
  }

  render() {
    let dataGroups = [...this.state.selectedDataGroups]
    // sort and then remove keys then make sure the type of extended ahas availableData
    // if a config had a typ eof data as selected, but the entity didn;t have that type of extended
    // the DataStack was showing data the GroupSelector wasn;t wasnt. 
    dataGroups = dataGroups.sort().map(n => n.substring(4)).filter(n => this.props.dataGroups && this.props.dataGroups[n]) 
    return (
      <div className="entity-detail-panel">
        <div className="entity-detail-summary">
          <h1>{_.get(this.props.entity,"Entity Name")}</h1>
          <EntityActionsPanel
            actions={this.props.actions}
            entity={this.props.entity}
            type={this.props.config.type}
            context={this.props.context}
          />
          <EntityDataGroupSelector
            config={this.props.config}
            dataGroups={this.props.dataGroups}
            loadingDataGroups={this.props.loadingDataGroups}
            selectedDataGroups={this.state.selectedDataGroups}
            onDataGroupSelect={this.dataGroupSelected}
          />
        <div className="entity-actions-panel" style={{float:"right", paddingRight: "20px"}}>
            <div className="dbm-tooltip">
              <i className="fas fa-angle-left"  onClick={this.props.onSummary}/>
              <span className="dbm-tooltiptext">Back to Summary</span>
            </div>
          </div>

        </div>
        <div className="entity-detail-data">
          <EntityDataStack
            config={this.props.config.data}
            entity={this.props.entity}
            dataGroups={dataGroups}
            collapsable={false}
            getData={this.props.getData} />
        </div>
      </div>
    )
  }
}


const EntityDataGroupSelector = ({dataGroups, loadingDataGroups, selectedDataGroups, onDataGroupSelect, config}) => {

  let availableGroups = dataGroups ? Object.entries(dataGroups).filter(([k,v]) => v===true).map(([k,v]) => k) : []
  availableGroups = availableGroups.map((k) => {return {k: k, index: Object.keys(config.data).findIndex(n => n === k)}})
  availableGroups.sort((a,b) => {
      if (a.index > b.index) return 1
      else if (b.index > a.index) return -1
      else return 0
  })

  let checkboxes = availableGroups.map(dgName => {
    return (
      <div key={"checkbox-"+dgName.k}>
        <input
          type="checkbox"
          checked={[...selectedDataGroups].map(n => n.substring(4)).includes(dgName.k)}
          onChange={e=>onDataGroupSelect(dgName.k, e.target.checked)}
        />
        <label>{dgName.k}</label>
      </div>
    )
  })
  return <div>
    {loadingDataGroups && <SimpleTextThrobber throbberText="Loading data"/>}
    <div className="entity-data-groups-selector">{checkboxes}</div>
  </div>
}


export default EntityDetailPanel;

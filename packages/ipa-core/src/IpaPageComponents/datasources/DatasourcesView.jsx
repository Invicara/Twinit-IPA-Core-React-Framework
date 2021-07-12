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
import _ from 'lodash'

import {IafDataSource} from '@invicara/platform-api'

import { DatasourceCard } from "./DatasourceCard";

import './DatasourcesView.scss'

class DatasourcesView extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        orchestrators: [],
        runs: {},
        runInterval: null
      }

      this._loadAsyncData = this._loadAsyncData.bind(this)
      this.getRuns = this.getRuns.bind(this)

    }

    async componentDidMount() {

      this._loadAsyncData()
      console.log('props', this.props);
      console.log('state', this.state);
    }

    componentWillUnmount() {
      clearInterval(this.state.runInterval)
      this.setState({runInterval: null})
    }

    async _loadAsyncData() {
       
      IafDataSource.getOrchestrators().then((orchs) => {
        let allOrchs = orchs._list
        allOrchs.sort((a,b) => a._name.localeCompare(b._name))
        this.setState({orchestrators: allOrchs})
        this.props.onLoadComplete()
      })
      
      this.getRuns()
      let interval = setInterval(this.getRuns, 5000)
      this.setState({runInterval: interval})
      
    }

    async getRuns() {
      IafDataSource.getOrchestratorRuns().then((runs) => {

        let groupedRuns = {}
        runs.forEach((run) => {
          if (!groupedRuns[run._orchid]) {
            groupedRuns[run._orchid] = []
          }

          groupedRuns[run._orchid].push(run)
        })
        this.setState({runs: groupedRuns})
      })
    }


    render() {

      return (
        <div className='datasources-view'>
          <div className='datasources-header'>
            <h1>Datasources</h1>
            <hr/>
          </div>
          <div className='datasources-list'>{this.state.orchestrators.map((o) => {
            return <DatasourceCard key={o.id} orchestrator={o} runs={this.state.runs[o.id]}/>
          })}</div>
        </div>

      )
    }
}

export default DatasourcesView;

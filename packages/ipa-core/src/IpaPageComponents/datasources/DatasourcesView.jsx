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
        orchestrators: []
      }

      this._loadAsyncData = this._loadAsyncData.bind(this)

    }

    async componentDidMount() {

      this._loadAsyncData()
      console.log('props', this.props);
      console.log('state', this.state);
  }

    async _loadAsyncData() {
       
      let orchs = await IafDataSource.getOrchestrators()
      this.setState({orchestrators: orchs._list})
      this.props.onLoadComplete()

    }

    render() {

      return (
        <div className='datasources-view'>
          <div className='datasources-header'>
            <h1>Datasources</h1>
            <hr/>
          </div>
          <div className='datasources-list'>{this.state.orchestrators.map((o) => {
            return <DatasourceCard orchestrator={o} />
          })}</div>
        </div>

      )
    }
}

export default DatasourcesView;

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
import {IafProj, IafUserGroup} from '@invicara/platform-api'
import {StackableDrawer} from '../../IpaControls/StackableDrawer'
import RadioButtons from '../../IpaControls/RadioButtons'

import _ from 'lodash'

import './UserGroupView.scss'

class UserGroupView extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        pageModes: ['UserGroups', 'Users'],
        pageMode: 'UserGroups'
      }

      this.onModeChange = this.onModeChange.bind(this)

    }

    async _loadAsyncData() {
       
    }
    
    async componentDidMount() {
        this.setState({isPageLoading: true});

        await this._loadAsyncData();

        this.setState({isPageLoading: false}, this.props.onLoadComplete);
        console.log('props', this.props);
        console.log('state', this.state);
    }

    onModeChange(e) {
      console.log(e)
      this.setState({pageMode: e.target.value})
    }

    render() {

        return (
          <div className='user-group-view'>

            <StackableDrawer level={1} iconKey='fas fa-users' defaultOpen={true}>
              <div className='switchable-list-view'>
                <div className='list-header'>
                  <div className='radio-btns'>
                    <RadioButtons options={this.state.pageModes} value={this.state.pageMode} onChange={this.onModeChange} labelPlacement='end' />
                  </div>
                  <div className='invite-link'>+ invite</div>
                </div>
              </div>
            </StackableDrawer>

            {this.state.pageMode === 'UserGroups' && <div>UserGroup Mode</div>}
            {this.state.pageMode === 'Users' && <div>User Mode</div>}

          </div>
        )
    }
}

export default UserGroupView;

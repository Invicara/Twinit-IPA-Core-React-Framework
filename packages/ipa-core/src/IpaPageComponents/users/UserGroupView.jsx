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
import clsx from "clsx";

import {IafProj, IafUserGroup} from '@invicara/platform-api'
import {StackableDrawer} from '../../IpaControls/StackableDrawer'
import RadioButtons from '../../IpaControls/RadioButtons'
import SimpleTextThrobber from '../../IpaControls/SimpleTextThrobber'

import _ from 'lodash'

import './UserGroupView.scss'

class UserGroupView extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        pageModes: ['UserGroups', 'Users'],
        pageMode: 'UserGroups',
        allUserGroupNamesUpper: [], //list of uppercase usergroup names for easy comparisons
        invalidUserGroups: [], //userGroups on the project th euser can't ineract with
        userGroups: [], //userGroups on the project the user can interact with
        selectedUserGroup: null, //the currently selected UserGroup
        editingUserGroup: false, //if the user is editng the UserGroup
        userGroupNameEdit: "", //the editable UserGroup name
        savingUserGroup: false, //if we are saving the UserGroup to the platform
        userGroupNameEditError: null, //any error with the UserGroup name
        users: [], //list of all users in the project
        selectedUser: null //the currently selected user
      }

      this.onModeChange = this.onModeChange.bind(this)
      this.getAllUserGroups = this.getAllUserGroups.bind(this)
      this.setSelectedUserGroup = this.setSelectedUserGroup.bind(this)
      this.toggleUserGroupEditable = this.toggleUserGroupEditable.bind(this)
      this.onUserGroupNameChange = this.onUserGroupNameChange.bind(this)
      this.updateUserGroup = this.updateUserGroup.bind(this)
      this.getAllUsers = this.getAllUsers.bind(this)
      this.setSelectedUser = this.setSelectedUser.bind(this)

    }

    async componentDidMount() {

      if (this.props.handler.config.defaultView && this.props.handler.config.defaultView.toUpperCase() === 'USERS')
        this.setState({pageMode: 'Users'}, this._loadAsyncData)
      else
        this.setState({pageMode: 'UserGroups'}, this._loadAsyncData)

      this.props.onLoadComplete();
      console.log('props', this.props);
      console.log('state', this.state);
  }

    async _loadAsyncData() {
       
      this.getAllUserGroups()
      this.getAllUsers()

    }
    
    onModeChange(e) {
      console.log(e)
      this.setState({pageMode: e.target.value, editingUserGroup: false})
    }

    async getAllUserGroups(selectedUserGroup) {
      
      //determines whether a group has a config matching one in configs
      function hasMatchingConfig(group, configs) {

        let match = false
        for (let i = 0; i < configs.length; i++) {
          if (_.find(group._userAttributes.userConfigs, {_id: configs[i]._id})) {
            match = true
            break
          }
        }
        
        return match
      }
      
      IafProj.getUserGroups(this.props.selectedItems.selectedProject).then(async (groups) => {
        
        //only show groups with a user config, as if there is no user config the group is not usable
        let groupsWithAnyUserConfig = groups.filter(g => g._userAttributes.userConfigs)

        //get all user configs int he project for this application (ie. _userType)
        IafProj.getUserConfigs(this.props.selectedItems.selectedProject, {query: {_userType: this.props.selectedItems.ipaConfig.configUserType}}).then((userConfigs) => {
          //further filter down to just the userGroups with a userConfig for this application
          let groupsWithAppUserConfig = groupsWithAnyUserConfig.filter(g => hasMatchingConfig(g, userConfigs))

          groupsWithAppUserConfig.sort((a,b) => {
            return a._name.localeCompare(b._name)
          })

          //get the list of userGroups in the project with out config for this app
          let invalidGroups = groups.filter((g) => {
            return !g._userAttributes.userConfig || !hasMatchingConfig(g, userConfigs)
          })

          let allUserGroupNamesUpper = groups.map(g => g._name.toUpperCase())

          let applySelectedUserGroup = selectedUserGroup ? selectedUserGroup : groupsWithAppUserConfig[0]

          this.setState({allUserGroupNamesUpper: allUserGroupNamesUpper, invalidUserGroups: invalidGroups, userGroups: groupsWithAppUserConfig, selectedUserGroup: applySelectedUserGroup})
        })
      })
    }

    setSelectedUserGroup(ug) {
      this.setState({selectedUserGroup: ug})
    }

    toggleUserGroupEditable(e) {
      if (e) e.preventDefault()
      this.setState({userGroupNameEdit: this.state.selectedUserGroup._name, editingUserGroup: !this.state.editingUserGroup, userGroupNameEditError: null})
    }

    onUserGroupNameChange(e) {
      console.log(e.target.value)
      this.setState({userGroupNameEdit: e.target.value})
    }

    updateUserGroup(e) {
      e.preventDefault()

      if (!this.state.allUserGroupNamesUpper.includes(this.state.userGroupNameEdit.toUpperCase())) {
        this.setState({savingUserGroup: true})
        let updatedGroup = Object.assign({}, this.state.selectedUserGroup, {_name: this.state.userGroupNameEdit})
        console.log('update ->', updatedGroup)

        IafUserGroup.update(updatedGroup).then((resGroup) => {

          this.toggleUserGroupEditable()
          this.setState({savingUserGroup: false, userGroups: [], invalidGroups: [], selectedUserGroup: null})
          this.getAllUserGroups(resGroup)

        }).catch((err) => {
          console.error('error saving usergroup change', err)
          this.setState({userGroupNameEditError: err.message})
        })
      } else {
        this.setState({userGroupNameEditError: "Duplicate UserGroup name! Please choose a different name."})
      }
      
    }

    getAllUsers() {
      IafProj.getUsers(this.props.selectedItems.selectedProject).then((allUsers) => {
        console.log(allUsers)
        allUsers.sort((a,b) => {return a._lastname.localeCompare(b._lastname)})
  
        this.setState({users: allUsers, selectedUser: allUsers[0]})
      })
    }

    setSelectedUser(ug) {
      this.setState({selectedUser: ug})
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
                <hr/>
                {this.state.pageMode === 'UserGroups' && <div>
                  {!this.state.selectedUserGroup && <SimpleTextThrobber throbberText='Loading UserGroups' />}
                  <ul className='user-group-list'>
                    {this.state.userGroups.map(u => <li key={u._id} onClick={(e) => this.setSelectedUserGroup(u)} className={clsx('user-group-list-item', u._id === this.state.selectedUserGroup._id && 'active')}>{u._name}</li>)}
                  </ul>
                </div>}
                {this.state.pageMode === 'Users' && <div>
                {!this.state.selectedUser && <SimpleTextThrobber throbberText='Loading Users' />}
                  <ul className='user-group-list'>
                    {this.state.users.map(u => <li key={u._id} onClick={(e) => this.setSelectedUser(u)} className={clsx('user-group-list-item', u._id === this.state.selectedUser._id && 'active')}>
                      <div className='user-full-name'>{u._lastname + ", " + u._firstname}</div>
                      <div className='user-email'>{u._email}</div>
                    </li>)}
                  </ul>
                </div>}
              </div>
            </StackableDrawer>

            {this.state.pageMode === 'UserGroups' && <div className='usergroup-mode-view'>
              <div className='row1'>
                {!this.state.editingUserGroup && <div className='usergroup-name'>
                  <h1>{this.state.selectedUserGroup ? this.state.selectedUserGroup._name : ""}</h1>
                  {this.props.handler.config.allowUserGroupEdit && this.state.selectedUserGroup && <span className='ug-btn'><a href="#" onClick={this.toggleUserGroupEditable}>edit</a></span>}
                </div>}
                {this.state.editingUserGroup && <div><div className='usergroup-name editable'>
                  <h1><input className='usergroup-name-input' type='text' disabled={this.state.savingUserGroup} value={this.state.userGroupNameEdit} onChange={this.onUserGroupNameChange}/></h1>
                  <span className='ug-btn'>
                    {!this.state.savingUserGroup && <a href="#" onClick={this.updateUserGroup}>save</a>}
                    {this.state.savingUserGroup && <span className='disabled-ug-btn'>save</span>}
                  </span>
                  <span className='ug-btn'>
                    {!this.state.savingUserGroup && <a href="#" onClick={this.toggleUserGroupEditable}>cancel</a>}
                    {this.state.savingUserGroup && <span className='disabled-ug-btn'>cancel</span>}
                  </span>
                </div>
                {this.state.userGroupNameEditError && <div className='usergroup-name-error'>{this.state.userGroupNameEditError}</div>}</div>}
              </div>
              <hr/>
              <div className='row2'>
                <div className='usergroup-members'>Members</div>
                <div className='usergroup-invites'>Invites</div>
              </div>
            </div>}

            {this.state.pageMode === 'Users' && <div>User Mode</div>}

          </div>
        )
    }
}

export default UserGroupView;

import React, { useCallback, useEffect, useState } from 'react'
import Select from 'react-select'
import {
  IafProj,
  IafUserGroup,
  IafSession,
  IafPassSvc
} from '@dtplatform/platform-api'
import _ from 'lodash'
import GenericModal from './GenericModal'
import SimpleTable from '../IpaControls/SimpleTable'
import SimpleTextThrobber from '../IpaControls/SimpleTextThrobber'

import './ProjectPickerModal.scss'
import '../IpaControls/SpinningLoadingIcon.scss'

const PROJECT_ID_KEY = 'ipaSelectedProjectId'

const InviteTable = ({
  invites,
  expired,
  inviteStatus,
  acceptInvite,
  rejectInvite
}) => (
  <SimpleTable
    className='invite-table'
    header={
      expired
        ? ['', 'Expired Invites', 'Role', '']
        : ['', 'Project', 'Role', '']
    }
    rows={invites.map(inv => {
      let status = inviteStatus[inv._id]
      let statusOrButtons = status ? (
        <span className={'invite-state-' + status.toLowerCase()}>{status}</span>
      ) : (
        <div>
          {expired ? (
            ''
          ) : (
            <span className='invite-action' onClick={e => acceptInvite(inv)}>
              <i className='fa fa-check'></i> Accept Invite
            </span>
          )}
          <span className='invite-action' onClick={e => rejectInvite(inv)}>
            <i className='fa fa-times'></i> {expired ? 'Remove' : 'Reject'}{' '}
            Invite
          </span>
        </div>
      )
      return [
        <span>&bull;</span>,
        inv._params.name,
        inv._usergroup._name,
        statusOrButtons
      ]
    })}
  />
)

const InviteSection = ({ onAcceptInvite }) => {
  const [invites, setInvites] = useState(null)
  const [inviteStatus, setInviteStatus] = useState({})

  let currentInvites =
    invites && invites.filter(inv => inv._status == 'PENDING')
  let expiredInvites =
    invites && invites.filter(inv => inv._status == 'EXPIRED')

  if (
    (!currentInvites || currentInvites.length === 0) &&
    (!expiredInvites || expiredInvites.length === 0)
  ) {
    return null
  }

  const updateInviteStatus = (invite, status) => {
    setInvites(currentInvites =>
      currentInvites
        ? currentInvites.filter(inv => inv._id != invite._id)
        : currentInvites
    )
    setInviteStatus(currentStatus => ({
      ...currentStatus,
      [invite._id]: status
    }))
  }

  const inviteFailed = (invite, e) => {
    console.error(e)
    setInviteStatus(currentStatus => ({
      ...currentStatus,
      [invite._id]: 'Failed: ' + e.message
    }))
  }

  const acceptInvite = invite => {
    setInviteStatus(currentStatus => ({
      ...currentStatus,
      [invite._id]: 'Accepting...'
    }))
    IafUserGroup.addUserToGroupByInvite(invite._usergroup, invite)
      .then(() => {
        updateInviteStatus(invite, 'Accepted')
        onAcceptInvite && onAcceptInvite()
      })
      .catch(e => inviteFailed(invite, e))
  }

  const rejectInvite = invite => {
    setInviteStatus(currentStatus => ({
      ...currentStatus,
      [invite._id]: 'Rejecting...'
    }))

    IafUserGroup.rejectInvite(invite._usergroup, invite._id)
      .then(() => updateInviteStatus(invite, 'Rejected'))
      .catch(e => inviteFailed(invite, e))
  }

  return (
    <div>
      {currentInvites && currentInvites.length > 0 && (
        <div>
          <h4>You have pending invitations:</h4>
          <InviteTable
            invites={currentInvites}
            expired={false}
            inviteStatus={inviteStatus}
            acceptInvite={acceptInvite}
            rejectInvite={rejectInvite}
          />
        </div>
      )}
      {expiredInvites && expiredInvites.length > 0 && (
        <div>
          <InviteTable
            invites={expiredInvites}
            expired={true}
            inviteStatus={inviteStatus}
            acceptInvite={acceptInvite}
            rejectInvite={rejectInvite}
          />
        </div>
      )}
    </div>
  )
}

const ProjectPickerModal = props => {
  const {
    configUserType,
    appContextProps,
    projectLoadHandlerCallback,
    testConfig,
    onConfigLoad,
    defaultConfig,
    referenceAppConfig,
    onCancel,
    userLogout,
    referenceAppCreateProject,
    onAcceptInvite
  } = props

  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [loadingUserGroups, setLoadingUserGroups] = useState(false)
  const [userGroups, setUserGroups] = useState([])
  const [selectedUserGroupId, setSelectedUserGroupId] = useState(null)
  const [remember, setRemember] = useState(true)
  const [user, setUser] = useState(null)

  const checkUserAccess = async () => {
    if (referenceAppConfig?.refApp) {
      try {
        let createTestProject = await IafPassSvc.createWorkspaces([])
        if (createTestProject && createTestProject?._total == 0) {
          setUser({
            has_access: true
          })
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  const setCssVariables = async () => {
    // Check if referenceAppConfig is defined and refApp is true
    if (referenceAppConfig?.refApp) {
      const result = await IafPassSvc.getConfigs()
      const root = document.documentElement
      console.log(result.themes.login)

      const accentColor =
        result.themes.login === 'mirrana' ? '#E04F29' : '#4bade8'
      const fancytreeOneColor =
        result.themes.login === 'mirrana' ? '#E04F29' : '#4bade8'
      const fancytreeOneChannelColor =
        result.themes.login === 'mirrana' ? '#e98469' : '#dbecee'

      root.style.setProperty('--app-accent-color', accentColor)
      root.style.setProperty('--fancytree-one-color', fancytreeOneColor)
      root.style.setProperty(
        '--fancytree-one-channel-color',
        fancytreeOneChannelColor
      )
    }
  }

  const saveChoice = configData => {
    sessionStorage.ipadt_configData = JSON.stringify(configData)
  }

  const clearSavedChoice = () => {
    delete sessionStorage.ipadt_configData
  }

  const loadConfig = async userConfig => {
    try {
      if (userConfig) {
        let latestUserConfigVersion = _.find(userConfig._versions, {
          _version: userConfig._tipVersion
        })
        let _userData = JSON.parse(latestUserConfigVersion._userData)

        _userData._id = userConfig._id

        const routes = await testConfig(_userData)

        if (remember) {
          saveChoice(_userData)
        } else {
          clearSavedChoice()
        }

        onConfigLoad(_userData, routes)
      } else {
        onConfigLoad(defaultConfig, testConfig(defaultConfig))
      }
    } catch (e) {
      console.log(e)
      onConfigLoad(defaultConfig, testConfig(defaultConfig))
    }
  }

  const loadProject = async project => {
    let userConfigs = []

    let selectedUserGroup = _.filter(
      userGroups,
      u => u._id === selectedUserGroupId
    )[0]
    if (!selectedUserGroup && userGroups) {
      selectedUserGroup = userGroups[0]
    }
    if (!selectedUserGroup) {
      userConfigs = await IafProj.getUserConfigs(project, {
        _userType: configUserType
      })
    } else {
      userConfigs.push(selectedUserGroup.userConfig)
    }

    if (userConfigs) {
      if (userConfigs.length > 1) {
        console.warn('There are ' + userConfigs.length + ' user configs found')
      }
      return loadConfig(userConfigs[0])
    } else {
      return loadConfig()
    }
  }

  const onRememberChange = event => {
    setRemember(event.target.checked)
  }

  const onProjectPicked = selectedOption => {
    const selectedProjectId = selectedOption.value
    setSelectedProjectId(selectedProjectId)
    window.localStorage.setItem('selectedProjectId', selectedProjectId)

    //Clear the selected user group when a project is picked
    setSelectedUserGroupId(undefined)
    window.localStorage.setItem('selectedUserGroupId', undefined)

    fetchUserGroups(projects, selectedProjectId)
  }
  const onUserGroupPicked = selectedOption => {
    const selectedUserGroupIdLocal = selectedOption.value
    setSelectedUserGroupId(selectedUserGroupIdLocal)
    window.localStorage.setItem('selectedUserGroupId', selectedUserGroupIdLocal)
  }

  const submitProjSelection = async () => {
    for (const project of projects) {
      if (project._id === selectedProjectId) {
        await IafProj.switchProject(project._id)
        let currProject = await IafProj.getCurrent()
        await loadProject(project)

        sessionStorage.setItem(PROJECT_ID_KEY, project._id)
        const selectedUserGroupIdLocal =
          userGroups?.length === 1 ? userGroups[0]._id : selectedUserGroupId

        projectLoadHandlerCallback &&
          projectLoadHandlerCallback({
            selectedProject: currProject,
            userGroup: userGroups?.find(
              UG => UG._id === selectedUserGroupIdLocal
            )
          })

        appContextProps.actions.setSelectedItems({
          selectedProject: currProject,
          selectedUserGroupId: selectedUserGroupIdLocal
        })
        window.location.hash = '/' //Since we're outside the react router scope, we need to deal with the location object directly

        // After a user accepts an invite, we make sure to remove the 'inviteId' from the URL
        if (window.location.href.includes('inviteId')) {
          window.location.href = `${window.location.origin}/`
        }
        if (referenceAppConfig?.refApp) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname + window.location.hash
          )
        }
        return
      }
    }
  }

  const fetchProjects = async () => {
    setLoadingProjects(true)
    const projects = await IafProj.getProjects({ _pageSize: 1000 })

    console.log('ProjectPickerModal fetchProjects projects', projects)
    setProjects(projects)
    setLoadingProjects(false)

    if(!projects || projects.length === 0) {
      return
    }
    //If no project is saved in localStorage, set the first project as a default`
    let selectedProjectId = window.localStorage.getItem('selectedProjectId')
    if(selectedProjectId === 'undefined') {
      selectedProjectId = undefined
    }

    if(!selectedProjectId) {
      selectedProjectId = projects?.[0]?._id
      setSelectedProjectId(projects?.[0]?._id)
      window.localStorage.setItem('selectedProjectId', projects?.[0]?._id)
    }

    if(projects.find(project => project._id === selectedProjectId)) {
      setSelectedProjectId(selectedProjectId)
      window.localStorage.setItem('selectedProjectId', selectedProjectId)
      fetchUserGroups(projects, selectedProjectId)
    }
  }

  const fetchUserGroups = async (projects, selectedProjectId) => {
    console.log('ProjectPickerModal fetchUserGroups projects, selectedProjectId', projects, selectedProjectId)

    if(!projects || projects.length === 0 || !selectedProjectId) {
      return  
    }

    setLoadingUserGroups(true)
    const selectedProject = projects.find(
      project => project._id === selectedProjectId
    )
    console.log('ProjectPickerModal fetchUserGroups selectedProject', selectedProject)

    const userGroups = await IafProj.getUserGroups(selectedProject)
    console.log('ProjectPickerModal fetchUserGroups userGroups', userGroups)
    setUserGroups(userGroups)
    
    //If no user group is saved in localStorage, set the first user group as a default
    let selectedUserGroupId = window.localStorage.getItem('selectedUserGroupId')
    if(selectedUserGroupId === 'undefined') {
      selectedUserGroupId = undefined
    }

    console.log('ProjectPickerModal fetchUserGroups selectedUserGroupId 1', selectedUserGroupId)

    if(!selectedUserGroupId) {
      selectedUserGroupId = userGroups?.[0]?._id
      setSelectedUserGroupId(userGroups?.[0]?._id)
      window.localStorage.setItem('selectedUserGroupId', userGroups?.[0]?._id)
      console.log('ProjectPickerModal fetchUserGroups selectedUserGroupId 2', selectedUserGroupId)
    }
    console.log('ProjectPickerModal fetchUserGroups selectedUserGroupId 3', selectedUserGroupId)

    if(userGroups.find(userGroup => userGroup._id === selectedUserGroupId)) {
      setSelectedUserGroupId(selectedUserGroupId)
      window.localStorage.setItem('selectedUserGroupId', selectedUserGroupId)
    }
    setLoadingUserGroups(false)
  }

  //load projects when the modal is mounted
  useEffect(() => {
    checkUserAccess()
    setCssVariables()

    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //load usergroups when the project is selected
  useEffect(() => {
  }, [projects, selectedProjectId])

  //TODO handle user modal manual close -> load default config
  const projectOptions =
    (!projects || projects.length == 0)
      ? [{ value: 'none', label: '' }]
      : projects.map(project => {
          return { value: project._id, label: project._name }
        })

  //We don't want to always set the selects to the first option.
  //We want to be able to display the last choices the user made in the dialog.
  //So we default to the first option, but if we find selectedItems in the appContext we use them
  //to open the dialog with settings they last chose
  let defaultProjectOption = projectOptions[0]
  if (selectedProjectId)
    defaultProjectOption = _.find(projectOptions, {
      value: selectedProjectId
    })

  const userGroupOptions = (userGroups || []).map(userGroup => {
    return { value: userGroup._id, label: userGroup._name }
  })

  console.log('ProjectPickerModal userGroupOptions', userGroupOptions)
  console.log('ProjectPickerModal userGroups', userGroups)
  console.log('ProjectPickerModal selectedUserGroupId', selectedUserGroupId)

  let defaultUserGroupOption = userGroupOptions[0]
  if (selectedUserGroupId) {
    defaultUserGroupOption = _.find(userGroupOptions, {
      value: selectedUserGroupId
    })
    console.log('ProjectPickerModal defaultUserGroupOption', defaultUserGroupOption)
  }
  console.log('ProjectPickerModal defaultUserGroupOption', defaultUserGroupOption)

  //A global loading state that describes if either the projects from the props are still loading
  // or if the modal is still loading something (usergroups or userconfigs)
  const loading = loadingUserGroups || loadingProjects

  return (
    <GenericModal
      title={<span>Project Selection</span>}
      modalBody={
        <div className='project-picker-modal'>
          {!loading && (!projects || projects.length === 0) && (
            <div>
              You are not yet a member of any projects, please
              {(!currentInvites || currentInvites.length === 0) && (
                <span> contact your project admin for an invite</span>
              )}
              {referenceAppConfig?.refApp && user?.has_access && (
                <div>
                  <button
                    onClick={() => referenceAppCreateProject(projects)}
                    className='setup'
                  >
                    Create Project
                  </button>
                  <button onClick={userLogout}>Logout</button>
                </div>
              )}
              {currentInvites && currentInvites.length > 0 && (
                <span> accept an invite</span>
              )}
            </div>
          )}

          {loadingProjects && (
            <SimpleTextThrobber throbberText='Loading your project information' />
          )}
          {referenceAppConfig?.refApp &&
          !loadingProjects &&
          !user?.has_access ? (
            <>
              <br />
              <div>
                <span className='text-danger'>
                  You don't have permission to create a project in the Reference
                  App. Please contact the Admin.
                </span>
              </div>
              <button onClick={userLogout}>Logout</button>
            </>
          ) : (
            <></>
          )}
          <InviteSection onAcceptInvite={onAcceptInvite} />

          {!loadingProjects && projects && projects.length > 0 && (
            <div>
              <h4>Project</h4>
              <Select
                name='projectSelect'
                options={projectOptions}
                defaultValue={defaultProjectOption}
                className={
                  referenceAppConfig?.refApp
                    ? 'custom-single-class'
                    : 'basic-single'
                }
                classNamePrefix='select'
                placeholder={'Select Project...'}
                onChange={onProjectPicked}
                isDisabled={projects.length < 2}
                isSearchable={false}
                menuPosition='fixed'
              />

              {userGroups && userGroups.length > 0 && (
                <div>
                  <h4>User Group</h4>
                  {(!loadingUserGroups ? (
                    <Select
                      name='userGroupSelect'
                      options={userGroupOptions}
                      defaultValue={defaultUserGroupOption}
                      className={
                        referenceAppConfig?.refApp
                          ? 'custom-single-class'
                          : 'basic-single'
                      }
                      classNamePrefix='select'
                      placeholder={'Select User Group...'}
                      onChange={onUserGroupPicked}
                      isDisabled={userGroups.length < 2}
                      isSearchable={false}
                      menuPosition='fixed'
                    />
                  ) : (
                    <div className='spinningLoadingIcon userGroupLoadingIcon'></div>
                  ))}
                </div>
              )}
        
                <div>
                  <div
                    className='custom-control custom-switch'
                    style={{ marginTop: '15px', zIndex: '0' }}
                  >
                    <input
                      type='checkbox'
                      className='custom-control-input'
                      id='remswitch'
                      value={remember}
                      checked={remember}
                      onChange={onRememberChange}
                    />
                    <label className='custom-control-label' htmlFor='remswitch'>
                      Remember my choices
                    </label>
                  </div>
                  <div className='button-container'>
                    <button
                      onClick={userLogout}
                      className={
                        referenceAppConfig?.refApp ? 'cancel' : 'default-cancel'
                      }
                    >
                      Logout
                    </button>
                    <button
                      onClick={onCancel}
                      className={
                        referenceAppConfig?.refApp ? 'cancel' : 'default-cancel'
                      }
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitProjSelection}
                      className={
                        referenceAppConfig?.refApp ? 'load' : 'default-load'
                      }
                      disabled={!selectedProjectId || !selectedUserGroupId}
                    >
                      Load Project
                    </button>
                    {referenceAppConfig?.refApp && (
                      <button
                        onClick={() => referenceAppCreateProject(projects)}
                        className='setup'
                      >
                        Create Project
                      </button>
                    )}
                  </div>
                </div>
            </div>
          )}
        </div>
      }
    />
  )
}

export default ProjectPickerModal

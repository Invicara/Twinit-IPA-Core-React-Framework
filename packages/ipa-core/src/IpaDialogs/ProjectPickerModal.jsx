import React, { useCallback, useEffect, useState } from 'react'
import Select from 'react-select'
import { Tooltip } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { IafProj, IafUserGroup, IafPassSvc } from '@dtplatform/platform-api'
import _ from 'lodash'
import { Dialog, Button, SingleSelect, Checkbox } from '@dtplatform/ipa-ui'
import GenericModal from './GenericModal'
import SimpleTable from '../IpaControls/SimpleTable'
import SimpleTextThrobber from '../IpaControls/SimpleTextThrobber'

import './ProjectPickerModal.scss'
import '../IpaControls/SpinningLoadingIcon.scss'

const PROJECT_ID_KEY = 'ipaSelectedProjectId'
const USER_GROUP_ID_KEY = 'ipaSelectedUserGroupId'
const CONFIG_DATA_KEY = 'ipadt_configData'

const PROJECT_PICKER_SELECT_STYLE_OVERRIDES = {
  singleSelect: 'project-picker-modal-single-select',
  container:
    'select-container select-input-container project-picker-modal-single-select__inner',
  trigger: 'select-trigger',
  popup: 'select-popup'
}

/** Tooltip for “Choose a user group” — Figma Sign-in / Project access (node 2822:1441). */
const USER_GROUP_FIELD_TOOLTIP =
  'Your user group controls what you can see and edit in the app'
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
    onProjectLoadStart,
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
    sessionStorage.setItem(CONFIG_DATA_KEY, JSON.stringify(configData))

    if (selectedProjectId) {
      sessionStorage.setItem(PROJECT_ID_KEY, selectedProjectId)
    }
    if (selectedUserGroupId) {
      sessionStorage.setItem(USER_GROUP_ID_KEY, selectedUserGroupId)
    }
  }

  const clearSavedChoice = () => {
    sessionStorage.removeItem(CONFIG_DATA_KEY)
    sessionStorage.removeItem(PROJECT_ID_KEY)
    sessionStorage.removeItem(USER_GROUP_ID_KEY)
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
      onConfigLoad(defaultConfig, testConfig(defaultConfig))
    }
  }

  const loadProject = async project => {
    let userConfigs = []
    let selectedUserGroup = _.filter(
      userGroups,
      u => u._id === selectedUserGroupId
    )[0]
    //If usergroups are loaded but the selected user group is not found in it, we recover by using the first usergroup
    if (!selectedUserGroup && userGroups) {
      selectedUserGroup = userGroups[0]
    }
    if (!selectedUserGroup) {
      //There is not selectedUserGroup because userGroups were not loaded, se we fetch user configs from the project
      userConfigs = await IafProj.getUserConfigs(project, {
        _userType: configUserType
      })
    } else {
      //now, we know we have a usergroup, so we add the user configs matching the client's userType from the usergroup to the empty user configs array
      userConfigs.push(...selectedUserGroup.matchingUserConfigs)
    }
    //If we have user configs by now, we load the config, if not loadConfig should manage with a default config.
    if (userConfigs) {
      if (userConfigs.length > 1) {
        console.warn('There are ' + userConfigs.length + ' user configs found')
      }
      //We fetch the full user config from the project, not just the user config from the usergroup
      const fullUserConfigs = await IafProj.getUserConfigs(project, {
        _id: userConfigs[0]._id
      })
      if (fullUserConfigs && fullUserConfigs.length > 0) {
        return loadConfig(fullUserConfigs[0])
      } else {
        console.error('Full user could not be fetched', userConfigs[0])
      }
    } else {
      return loadConfig()
    }
  }

  const onProjectPicked = selectedOption => {
    const selectedProjectIdLocal = selectedOption
    setSelectedProjectId(selectedProjectIdLocal)

    //Clear the selected user group when a project is picked
    setSelectedUserGroupId(undefined)

    fetchUserGroups(projects, selectedProjectIdLocal)
  }
  const onUserGroupPicked = selectedOption => {
    const selectedUserGroupIdLocal = selectedOption
    setSelectedUserGroupId(selectedUserGroupIdLocal)
  }

  const submitProjSelection = async () => {
    const hasExistingProject = !!sessionStorage.getItem(CONFIG_DATA_KEY)
    onProjectLoadStart && onProjectLoadStart(hasExistingProject)
    for (const project of projects) {
      if (project._id === selectedProjectId) {
        await IafProj.switchProject(project._id)
        let currProject = await IafProj.getCurrent()
        await loadProject(project)

        //Let the AppProvider know what project is selected
        const selectedUserGroupIdLocal = selectedUserGroupId
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

    setProjects(projects)
    setLoadingProjects(false)

    if (!projects || projects.length === 0) {
      return
    }
    //Find the project in session or set the first project as the selected project by default
    let sessionSelectedProjectId = sessionStorage.getItem(PROJECT_ID_KEY)
    let selectedProjectIdLocal
    if (
      sessionSelectedProjectId &&
      projects.find(project => project._id === sessionSelectedProjectId)
    ) {
      //could not find the project in the session, so we set the first project as the selected project by default
      selectedProjectIdLocal = sessionSelectedProjectId
      setSelectedProjectId(sessionSelectedProjectId)
    } else {
      //We could not find the project in the session, so we set the first project as the selected project by default
      selectedProjectIdLocal = projects?.[0]?._id
      setSelectedProjectId(projects?.[0]?._id)
    }
    fetchUserGroups(projects, selectedProjectIdLocal)
  }

  const filterUserGroups = (projectUserGroups, projectUserConfigsMap) => {
    //We filter the project userGroups by checking if any of the user group's user configs are in the project user configs.
    //For this to work, we need to pass a map of the project user configs by their _id that has been filtered by the client's userType.
    return projectUserGroups.filter((userGroup) => {
      if(!userGroup._userAttributes?.userConfigs) return false
    
      let userConfigsWithMatchingUserType = userGroup._userAttributes?.userConfigs.filter((userConfig) => {
        return !!projectUserConfigsMap[userConfig._id]
      })
      userGroup.matchingUserConfigs = userConfigsWithMatchingUserType;
      return userGroup.matchingUserConfigs.length > 0
    })
  }

  const fetchUserGroups = async (projects, selectedProjectIdLocal) => {
    if (!projects || projects.length === 0) {
      //Usergroups cannot be loaded
      return
    }
    setLoadingUserGroups(true)

    const selectedProject = projects.find(
      project => project._id === selectedProjectIdLocal
    )

    let projectUserGroups = await IafProj.getUserGroups(selectedProject)
    //We fetch the selected project user configs with a userType matching the client's userType.
    let userConfigs = await IafProj.getUserConfigs(selectedProject, {
      _userType: configUserType
    })

    //This map is used to quickly check if a user config exists in the project user configs.
    let userConfigsMap = {};
    userConfigs.forEach((userConfig) => {
      userConfigsMap[userConfig._id] = userConfig;
    })

    let userGroups;
    if(userConfigs && userConfigs.length > 0) {
      //Now we can remove all userGroups that don't have a user config with the same userType.
      userGroups = filterUserGroups(projectUserGroups, userConfigsMap)
    } else {
      console.log('no userConfigs found', userGroups)
      userGroups = []; //If no matching user configs are found, no userGroups are allowed to be selected
    }

    //Find the usergroup in session or set the first user group of the project as the selected user group by default
    let sessionSelectedUserGroupId = sessionStorage.getItem(USER_GROUP_ID_KEY)
    if (
      sessionSelectedUserGroupId &&
      userGroups.find(userGroup => userGroup._id === sessionSelectedUserGroupId)
    ) {
      //We found the usergroup in the session and it exists in the project
      setSelectedUserGroupId(sessionSelectedUserGroupId)
    } else {
      //We could not find the usergroup in the session or it does not exist in the project, so we set the first user group of the project as the selected user group by default
      setSelectedUserGroupId(userGroups?.[0]?._id)
    }

    setUserGroups(userGroups)
    setLoadingUserGroups(false)
  }

  //load projects when the modal is mounted
  useEffect(() => {
    checkUserAccess()
    setCssVariables()

    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //TODO handle user modal manual close -> load default config
  const projectOptions =
    !projects || projects.length == 0
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

  let defaultUserGroupOption = userGroupOptions[0]
  if (selectedUserGroupId) {
    defaultUserGroupOption = _.find(userGroupOptions, {
      value: selectedUserGroupId
    })
  }
  const loading = loadingUserGroups || loadingProjects

  const hasExistingProject = !!sessionStorage.getItem(CONFIG_DATA_KEY)

  return (
    <Dialog
      title={!hasExistingProject ? "Project access" : "Switch project"}
      open={true}
      disableCloseButton={!hasExistingProject}
      disableClickOutside={!hasExistingProject}
      hideOverlay={!hasExistingProject}
      disableEscapeKey={!hasExistingProject}
      onOpenChange={open => {
        if (!open) onCancel?.()
      }}
      styleOverrides={{
        content: 'project-picker-modal-dialog-content',
        header: 'dialog-header',
        title: !hasExistingProject
          ? 'dialog-title dialog-title__no-close-button'
          : 'dialog-title',
        closeButton: 'dialog-close-button',
        body: 'dialog-body'
      }}
      children={
        <div className='project-picker-modal'>
          {!loading && (!projects || projects.length === 0) && (
            <div>
              You are not yet a member of any projects, please
              {(!currentInvites || currentInvites.length === 0) && (
                <span> contact your project admin for an invite</span>
              )}
              {referenceAppConfig?.refApp && user?.has_access && (
                <div>
                  <Button
                    onClick={() => referenceAppCreateProject(projects)}
                  >
                    Create Project
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={userLogout}
                  >
                    Logout
                  </Button>
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
              <Button
                variant="secondary"
                onClick={userLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <></>
          )}
          <InviteSection onAcceptInvite={onAcceptInvite} />

          {!loadingProjects && projects && projects.length > 0 && (
            <div>
              <h4>Choose a project</h4>
              <SingleSelect
                name='projectSelect'
                options={projectOptions}
                value={selectedProjectId}
                className={
                  referenceAppConfig?.refApp
                    ? 'select custom-single-class'
                    : 'select basic-single'
                }
                styleOverrides={PROJECT_PICKER_SELECT_STYLE_OVERRIDES}
                placeholder={'Select Project...'}
                onChange={onProjectPicked}
                disabled={projects.length < 2}
                filter={false}
              />

              {userGroups && userGroups.length > 0 && (
                <div>
                    <div className={`usergroup-select-container ${loadingUserGroups ? 'hidden' : ''}`}>
                      <div className='project-picker-modal-field-label'>
                        <h4 className='project-picker-modal-field-label__text'>
                          Choose a user group
                        </h4>
                        <Tooltip
                          title={USER_GROUP_FIELD_TOOLTIP}
                          placement='top'
                          arrow
                          enterDelay={200}
                          PopperProps={{
                            modifiers: [
                              {
                                name: 'offset',
                                options: { offset: [0, -8] }
                              }
                            ]
                          }}
                          componentsProps={{
                            tooltip: {
                              className: 'project-picker-modal-field-tooltip'
                            },
                            arrow: {
                              className: 'project-picker-modal-field-tooltip-arrow'
                            }
                          }}
                        >
                          <span
                            className='project-picker-modal-field-label__info'
                            tabIndex={0}
                            aria-label='About user groups'
                          >
                            <InfoIcon
                              className='project-picker-modal-field-label__info-icon'
                              aria-hidden
                            />
                          </span>
                        </Tooltip>
                      </div>
                      <SingleSelect
                        name='userGroupSelect'
                        options={userGroupOptions}
                        value={selectedUserGroupId}
                        className={
                          referenceAppConfig?.refApp
                            ? 'select custom-single-class'
                            : 'select basic-single'
                        }
                        styleOverrides={PROJECT_PICKER_SELECT_STYLE_OVERRIDES}
                        placeholder={'Select User Group...'}
                        onChange={onUserGroupPicked}
                        disabled={userGroups.length < 2}
                        filter={false}
                      />
                    </div>
                    {loadingUserGroups && (
                      <SimpleTextThrobber throbberText='Loading user groups' />
                    )}
                  </div>
              )}

              {!loadingUserGroups && userGroups && userGroups.length === 0 && (
                <div className='project-picker-modal-no-usergroups'>
                  <p>No user groups available for this project. Please choose another project or contact your project admin.</p>
                </div>
              )}

              <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Checkbox
                  id='remswitch'
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked === true)}
                />
                <label htmlFor='remswitch' style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Remember my choice
                </label>
              </div>
            </div>
          )}
        </div>
      }
      footer={
        <div className='button-container'>
          <Button
            onClick={submitProjSelection}
            disabled={!selectedProjectId || !selectedUserGroupId || loadingUserGroups || loadingProjects}
            className={'dialog-footer-button'}
          >
            {hasExistingProject ? 'Switch Project' : 'Load Project'}
          </Button>
          {referenceAppConfig?.refApp && (
            <Button
              onClick={() => referenceAppCreateProject(projects)}
              className={'dialog-footer-button'}
            >
              Create Project
            </Button>
          )}
          <Button
            variant="tertiary"
            onClick={userLogout}
            className={'dialog-footer-button logout-button'}
          >
            Sign out
          </Button>
        </div>
      }
    />
  )
}

export default ProjectPickerModal

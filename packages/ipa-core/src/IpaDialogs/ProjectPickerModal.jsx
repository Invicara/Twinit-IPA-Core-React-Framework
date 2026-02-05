import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import {IafProj, IafUserGroup, IafSession, IafPassSvc} from '@dtplatform/platform-api';
import _ from 'lodash';
import GenericModal from "./GenericModal";
import SimpleTable from "../IpaControls/SimpleTable"
import SimpleTextThrobber from '../IpaControls/SimpleTextThrobber'

import './ProjectPickerModal.scss'
import '../IpaControls/SpinningLoadingIcon.scss'

const PROJECT_ID_KEY = "ipaSelectedProjectId"

const ProjectPickerModal = (props) => {
  const {
    projects,
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
  } = props;

  const [loadingModal, setLoadingModal] = useState(true);
  const [projectsState, setProjectsState] = useState([]);
  const [appUserGroups, setAppUserGroups] = useState({});
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [userGroupOptions, setUserGroupOptions] = useState([]);
  const [selectedUserGroupId, setSelectedUserGroupId] = useState(null);
  const [remember, setRemember] = useState(true);
  const [projectUserGroups, setProjectUserGroups] = useState([]);
  const [showLoadButton, setShowLoadButton] = useState(false);
  const [inviteStatus, setInviteStatus] = useState({});
  const [invites, setInvites] = useState(null);
  const [user, setUser] = useState(null);
  const [userGroupValue, setUserGroupValue] = useState(null);

  const checkUserAccess = async () => {
    if (referenceAppConfig?.refApp) {
      try {
        let createTestProject = await IafPassSvc.createWorkspaces([]);
        if (createTestProject && createTestProject?._total == 0) {
          setUser({
              has_access: true,
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const setCssVariables = async () => {
    // Check if referenceAppConfig is defined and refApp is true
    if (referenceAppConfig?.refApp) {
      const result = await IafPassSvc.getConfigs();
      const root = document.documentElement;
      console.log(result.themes.login);

      const accentColor = result.themes.login === "mirrana" ? "#E04F29" : "#4bade8";
      const fancytreeOneColor =
        result.themes.login === "mirrana" ? "#E04F29" : "#4bade8";
      const fancytreeOneChannelColor =
        result.themes.login === "mirrana" ? "#e98469" : "#dbecee";

      root.style.setProperty("--app-accent-color", accentColor);
      root.style.setProperty("--fancytree-one-color", fancytreeOneColor);
      root.style.setProperty(
        "--fancytree-one-channel-color",
        fancytreeOneChannelColor
      );
    }
  };

  const getUserGroupOptions = (projectid) => {
    return appUserGroups[projectid]
      ? appUserGroups[projectid].map((ug) => {return {'value': ug._id, 'label': ug._name}})
      : [];
  };

  const saveChoice = (configData) => {
    sessionStorage.ipadt_configData = JSON.stringify(configData);
  };

  const clearSavedChoice = () => {
    delete sessionStorage.ipadt_configData;
  };

  const loadConfig = async (userConfig) => {
    try {
      if(userConfig) {

        let latestUserConfigVersion = _.find(userConfig._versions, {_version: userConfig._tipVersion})
        let _userData = JSON.parse(latestUserConfigVersion._userData)

        _userData._id = userConfig._id;

        const routes = await testConfig(_userData);

        if (remember) {
          saveChoice(_userData)
        } else {
          clearSavedChoice();
        }

        onConfigLoad(_userData, routes);
      }else{
        onConfigLoad(defaultConfig, testConfig(defaultConfig));
      }
    } catch (e) {
      console.log(e);
      onConfigLoad(defaultConfig, testConfig(defaultConfig));
    }
  };

  const loadProject = async (project) => {
    let userConfigs = [];

    let selectedUserGroup = _.filter(projectUserGroups, u => u._id === selectedUserGroupId)[0];
    if(!selectedUserGroup && projectUserGroups) {
      selectedUserGroup = projectUserGroups[0];
    }
    if(!selectedUserGroup) {
      userConfigs = await IafProj.getUserConfigs(project, {_userType: configUserType});
    }else {
      userConfigs.push(selectedUserGroup.userConfig);
    }

    if (userConfigs) {
      if (userConfigs.length > 1) {
        console.warn('There are ' + userConfigs.length + ' user configs found');
      }
      return loadConfig(userConfigs[0]);
    } else {
      return loadConfig();
    }
  };

  const onRememberChange = (event) => {
    setRemember(event.target.checked);
  };

  const onProjectPicked = (selectedOption) => {
    const projectId = selectedOption.value;
    setShowLoadButton(false);
    setProjectUserGroups([]);
    setUserGroupOptions([]);

    let projectUserGroupsForProject = appUserGroups[projectId]
    let selectedUserGroupIdForProject = appUserGroups[projectId][0]._id

    const selectUserGroupOptions = getUserGroupOptions(projectId)

    setSelectedProjectId(projectId);
    setShowLoadButton(true);
    setProjectUserGroups(projectUserGroupsForProject);
    setUserGroupOptions(selectUserGroupOptions);
    setUserGroupValue(selectUserGroupOptions[0]);
    setSelectedUserGroupId(selectedUserGroupIdForProject);
  };

  const onUserGroupPicked = (selectedOption) => {
    const selectedUserGroupIdLocal = selectedOption.value;
    setSelectedUserGroupId(selectedUserGroupIdLocal);
    setUserGroupValue(selectedOption);
    console.log("selectedOption", selectedOption)
    console.log("selectedUserGroupId",selectedUserGroupIdLocal)
    window.localStorage.setItem("selectedUserGroup", selectedOption.label);
    window.localStorage.setItem("selectedUserGroupId",selectedUserGroupIdLocal)
  };

  const submitProjSelection = async () => {
    for (const project of projects) {
      if (project._id === selectedProjectId) {
        await IafProj.switchProject(project._id);
        let currProject = await IafProj.getCurrent();
        await loadProject(project);

        sessionStorage.setItem(PROJECT_ID_KEY, project._id)
        const selectedUserGroupIdLocal =
          projectUserGroups?.length === 1
            ? projectUserGroups[0]._id
            : selectedUserGroupId;

        projectLoadHandlerCallback && projectLoadHandlerCallback({
          selectedProject: currProject,
          userGroup: projectUserGroups?.find((UG)=>UG._id === selectedUserGroupIdLocal)
        });

        appContextProps.actions.setSelectedItems({ selectedProject: currProject, selectedUserGroupId: selectedUserGroupIdLocal });
        window.location.hash = '/'; //Since we're outside the react router scope, we need to deal with the location object directly

        // After a user accepts an invite, we make sure to remove the 'inviteId' from the URL
        if(window.location.href.includes('inviteId')) {
          window.location.href = `${window.location.origin}/`
        }
        if (referenceAppConfig?.refApp) {
          window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        }
        return;
      }
    }
  };

  const updateInviteStatus = (invite, status) => {
    setInvites((currentInvites) =>
      currentInvites ? currentInvites.filter(inv => inv._id != invite._id) : currentInvites
    );
    setInviteStatus((currentStatus) => ({
      ...currentStatus,
      [invite._id]: status
    }));
  };

  const inviteFailed = (invite, e) => {
    console.error(e);
    setInviteStatus((currentStatus) => ({
      ...currentStatus,
      [invite._id]: "Failed: " + e.message
    }));
  };

  const acceptInvite = (invite) => {
    setInviteStatus((currentStatus) => ({
      ...currentStatus,
      [invite._id]: "Accepting..."
    }));
    IafUserGroup.addUserToGroupByInvite(invite._usergroup, invite)
      .then(() => {
        updateInviteStatus(invite, "Accepted");
        onAcceptInvite && onAcceptInvite();
      })
      .catch(e => inviteFailed(invite, e));
  };

  const rejectInvite = (invite) => {
    setInviteStatus((currentStatus) => ({
      ...currentStatus,
      [invite._id]: "Rejecting..."
    }));

    IafUserGroup.rejectInvite(invite._usergroup, invite._id)
      .then(() => updateInviteStatus(invite, "Rejected"))
      .catch(e => inviteFailed(invite, e));
  };

  useEffect(() => {
    checkUserAccess();
    setCssVariables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadModal = async () => {
    function getFirstMatchingConfig(group, configs) {

      let match = null
      for (let i = 0; i < group._userAttributes.userConfigs.length; i++) {
        let found = _.find(configs, {_id: group._userAttributes.userConfigs[i]._id})
        if (found) {
          match = found
          break
        }
      }
      
      return match
    }

      IafPassSvc.getUserInvites().then((invitesResult) => {
        setInvites(invitesResult);
      });
    if(projects && projects.length > 0) {

      let myProjects = []
      let myUserGroups = {}

      //for each project get the user's userGroups
      for (let i = 0; i < projects.length; i++) {

        let userGroups = await IafProj.getUserGroupsForCurrentUser(projects[i])

        //filter out groups with no configs
        if (userGroups)
          userGroups = userGroups.filter(ug => !!ug._userAttributes.userConfigs)
        else {
          console.log('no userGroups')
          console.log(projects[i])
          continue
        }

        //get all userConfigs in the project that match the app's usertype.
          let userConfigs = await IafProj.getUserConfigs(projects[i], {_userType: configUserType})
        
        //get userConfig for each remaining userGroup
        userGroups.forEach((ug) => [
          ug.userConfig = getFirstMatchingConfig(ug, userConfigs)
        ])

        //find the userGroups in the project that have application configs
        userGroups = userGroups.filter(ug => ug.userConfig)

        //if a project has no userGroups remove the project
        if (userGroups && userGroups.length) {
          myProjects.push(projects[i])
          myUserGroups[projects[i]._id] = userGroups
        }

      }

      console.log(myProjects, myUserGroups)
      
      //serve projects and usergroups from state
        setProjectsState(myProjects);
        setAppUserGroups(myUserGroups);

      //check selectedItems and see if project and usergroup apply and if so set them to current
      let projectid, usergroupid;
        if (!appContextProps.selectedItems.selectedProject || !myUserGroups[appContextProps.selectedItems.selectedProject._id]){
          IafSession.setSessionStorage('project', {_namespaces: _.get(projects, '0._namespaces')});
          projectid = myProjects[0] ? myProjects[0]._id : null;
          usergroupid = projectid ? myUserGroups[myProjects[0]._id][0]._id : null
      } else {

          projectid = appContextProps.selectedItems.selectedProject._id;

          if(selectedUserGroupId && projectid == selectedProjectId){
            usergroupid = selectedUserGroupId;
          }else if (appContextProps.selectedItems.selectedUserGroupId)
            usergroupid = appContextProps.selectedItems.selectedUserGroupId;
          else
            usergroupid = myUserGroups[myProjects[0]._id][0]._id
      }

      const selectUserGroupOptions = myUserGroups[projectid]
        ? myUserGroups[projectid].map((ug) => ({ value: ug._id, label: ug._name }))
        : []

        setSelectedProjectId(projectid);
        setShowLoadButton(true);
        setProjectUserGroups(myUserGroups[projectid]);
        setUserGroupOptions(selectUserGroupOptions);
        setUserGroupValue(_.find(selectUserGroupOptions, {value: usergroupid}));
        setSelectedUserGroupId(usergroupid);
        setLoadingModal(false);
      }
      else {
        setLoadingModal(false);
      }
    };

    loadModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

    const loadBtn = showLoadButton ? (<div>
          <div className='custom-control custom-switch' style={{marginTop: '15px', zIndex: '0'}}>
              <input
                type="checkbox"
                className="custom-control-input"
                id="remswitch"
                value={remember}
                checked={remember}
                onChange={onRememberChange}
              />
                <label className="custom-control-label" htmlFor="remswitch">Remember my choice</label>
          </div>
          <div className='button-container'>
            <button 
            onClick={userLogout} 
            className={referenceAppConfig?.refApp ? "cancel" : "default-cancel"}
            >
              Logout
            </button>
          <button
            onClick={onCancel}
            className={
            referenceAppConfig?.refApp ? "cancel" : "default-cancel"
            }
          >
            Cancel
          </button>
          <button
          onClick={submitProjSelection}
            className={
            referenceAppConfig?.refApp ? "load" : "default-load"
            }
          >
            Load Project
          </button>
        {referenceAppConfig?.refApp && (
          <button onClick={referenceAppCreateProject} className="setup">
              Create Project
            </button>
          )}
          </div>
        </div>
      ) : <div className="spinningLoadingIcon projectLoadingIcon"></div>;

    //TODO handle user modal manual close -> load default config
  const selectProjectOptions = (!projectsState || projectsState.length == 0) ? [{value: 'none', label: ''}] :
      projectsState.map((project) => {return {'value': project._id, 'label': project._name}});

    //We don't want to always set the selects to the first option.
    //We want to be able to display the last choices the user made in the dialog.
    //So we default to the first option, but if we find selectedItems in the appContext we use them
    //to open the dialog with settings they last chose
    let defaultProjectOption = selectProjectOptions[0];
  if (selectedProjectId) defaultProjectOption = _.find(selectProjectOptions, {value: selectedProjectId})

    let currentInvites = invites && invites.filter(inv => inv._status == "PENDING")
    let expiredInvites = invites && invites.filter(inv => inv._status == "EXPIRED")

  const buildInviteTable = (invitesForTable, expired) => <SimpleTable
        className="invite-table"
        header = { expired ? ["", "Expired Invites", "Role", ""] : ["", "Project", "Role", ""]}
      rows={invitesForTable.map(inv => {
        let status = inviteStatus[inv._id]
          let statusOrButtons =
            status
              ? <span className={"invite-state-"+status.toLowerCase()}>{status}</span>
              : <div>
                { expired  ? "" : <span className='invite-action' onClick={e=>acceptInvite(inv)}><i className="fa fa-check"></i> Accept Invite</span> }
                <span className='invite-action' onClick={e=>rejectInvite(inv)}><i className="fa fa-times"></i> {expired ? "Remove" : "Reject"} Invite</span>
                </div>
          return [<span>&bull;</span>,inv._params.name, inv._usergroup._name, statusOrButtons]})}
        />

    let title = <span>Project Selection</span>
    return (
      <GenericModal
        title={title}
        modalBody={
          <div className="project-picker-modal">
            {
            (!loadingModal && (!projectsState || projectsState.length === 0)) &&
              <div>
                You are not yet a member of any projects, please
                {(!currentInvites || currentInvites.length === 0) && <span> contact your project admin for an invite</span>}

              {referenceAppConfig?.refApp && user?.has_access && (
                  <div>
                  <button onClick={referenceAppCreateProject} className="setup">
              Create Project
            </button>
                  <button onClick={userLogout}>
            Logout
          </button>
          </div>
          )}
                {(currentInvites && currentInvites.length > 0) && <span> accept an invite</span>}
              </div>
            }

          {loadingModal && <SimpleTextThrobber throbberText="Loading your project information" />}
          {referenceAppConfig?.refApp &&
            !showLoadButton &&
          !loadingModal &&
          !user?.has_access ? (
              <>
                <br />
                <div>
                  <span className="text-danger">
                    You don't have permission to create a project in the Reference App.
                    Please contact the Admin.
                  </span>
                </div>
              <button onClick={userLogout}>
                  Logout
                </button>
              </>
            ) : (
              <></>
            )}
            <div>
              {currentInvites && currentInvites.length > 0 &&
                <div>
                  <h4>You have pending invitations:</h4>
                  { buildInviteTable(currentInvites, false) }
                </div>
              }
              {expiredInvites && expiredInvites.length > 0 &&
                <div>
                  { buildInviteTable(expiredInvites, true) }
                </div>
              }
            </div>

            {
            !loadingModal && projectsState && projectsState.length > 0 &&
              <div>
                <h4>Project</h4>
                <Select
                    name="projectSelect"
                    options={selectProjectOptions}
                    defaultValue={defaultProjectOption}
                    className={referenceAppConfig?.refApp ? "custom-single-class" : "basic-single"}
                    classNamePrefix="select"
                    placeholder={'Select Project...'}
                    onChange={onProjectPicked}
                    isDisabled={!showLoadButton}
                    isSearchable={false}
                    menuPosition='fixed'
                />

                {
                  projectUserGroups && projectUserGroups.length > 1 &&
                  <div>
                    <h4>User Group</h4>
                    <Select
                        name="userGroupSelect"
                      options={userGroupOptions}
                      value={userGroupValue}
                      className={referenceAppConfig?.refApp ? "custom-single-class" : "basic-single"}
                        classNamePrefix="select"
                        placeholder={'Select User Group...'}
                      onChange={onUserGroupPicked}
                        isSearchable={false}
                        menuPosition='fixed'
                    />
                  </div>
                }

                {loadBtn}

              </div>
            }
          </div>
        }
      />
    );
  }

export default ProjectPickerModal;

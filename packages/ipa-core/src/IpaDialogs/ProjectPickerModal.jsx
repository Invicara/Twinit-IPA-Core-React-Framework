import React from 'react';
import Select from 'react-select';
import {IafProj, IafUserGroup, IafHelper, IafSession, IafPassSvc} from '@invicara/platform-api';
import _ from 'lodash';
import GenericModal from "./GenericModal";
import SimpleTable from "../IpaControls/SimpleTable"
import SimpleTextThrobber from '../IpaControls/SimpleTextThrobber'

import './ProjectPickerModal.scss'
import '../IpaControls/SpinningLoadingIcon.scss'

const PROJECT_ID_KEY = "ipaSelectedProjectId"

export default class ProjectPickerModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingModal: true,
      projects: [],
      appUserGroups: [],
      selectedProjectId: null,
      userGroupOptions: [],
      selectedUserGroupId: null,
      remember: true,
      projectUserGroups: [],
      showLoadButton: false,
      inviteStatus: {}
    };

    this.getUserGroupOptions = this.getUserGroupOptions.bind(this)
  }

  componentDidMount = async () => {
    this.checkUserAccess();
    this.loadModal();
    this.setCssVariables();

  }

  componentDidUpdate = async (prevProps, prevState) => {

    if (this.props.projects !== prevProps.projects)
      this.loadModal();

  }
  checkUserAccess = async () => {
    if (this.props.referenceAppConfig?.refApp) {
      try {
        let createTestProject = await IafPassSvc.createWorkspaces([]);
        if (createTestProject && createTestProject?._total == 0) {
          this.setState({
            user: {
              has_access: true,
            },
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };
  setCssVariables() {
    const { referenceAppConfig } = this.props;

    // Check if referenceAppConfig is defined and refApp is true
    if (referenceAppConfig?.refApp) {
      const root = document.documentElement;

      // Set CSS variables with the provided colors
      root.style.setProperty('--app-accent-color', referenceAppConfig.style.appColor);
    }
  };

  getUserGroupOptions = (projectid) => {
    return this.state.appUserGroups[projectid] ? this.state.appUserGroups[projectid].map((ug) => {return {'value': ug._id, 'label': ug._name}}) : [];
  }

  loadModal = async () => {

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

    const {projects} = this.props;
    this.getInvites()
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

        //get all userConfigs in the project
        let userConfigs = await IafProj.getUserConfigs(projects[i], {_userType: this.props.configUserType})
        
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
      this.setState({projects: myProjects, appUserGroups: myUserGroups})

      //check selectedItems and see if project and usergroup apply and if so set them to current
      let projectid, usergroupid;
      if (!this.props.appContextProps.selectedItems.selectedProject || !myUserGroups[this.props.appContextProps.selectedItems.selectedProject._id]){
          IafSession.setSessionStorage('project', {_namespaces: _.get(projects, '0._namespaces')});
          //res = await this.checkUserConfigs(projects[0]);
          projectid = myProjects[0] ? myProjects[0]._id : null;
          //usergroupid = res.selectedUserGroupId;
          usergroupid = projectid ? myUserGroups[myProjects[0]._id][0]._id : null
      }
      else {

          projectid = this.props.appContextProps.selectedItems.selectedProject._id;

          if(this.state.selectedUserGroupId && projectid == this.state.selectedProjectId){
            usergroupid = this.state.selectedUserGroupId;
          }else if (this.props.appContextProps.selectedItems.selectedUserGroupId)
            usergroupid = this.props.appContextProps.selectedItems.selectedUserGroupId;
          else
            //usergroupid = res.selectedUserGroupId;
            usergroupid = myUserGroups[myProjects[0]._id][0]._id
      }

      const selectUserGroupOptions = this.getUserGroupOptions(projectid)

      this.setState({selectedProjectId: projectid, showLoadButton: true,
        projectUserGroups: myUserGroups[projectid],
        userGroupOptions: selectUserGroupOptions,
        userGroupValue: _.find(selectUserGroupOptions, {value: usergroupid}),
        selectedUserGroupId: usergroupid,
        loadingModal: false});
    }
    else {
      this.setState({loadingModal: false})
    }
  }

  saveChoice = (configData) => {
    sessionStorage.ipadt_configData = JSON.stringify(configData);
  }

  clearSavedChoice = () => {
    delete sessionStorage.ipadt_configData;
  }

  getInvites = () => {
      IafPassSvc.getUserInvites().then((invites) => {
        this.setState({invites});
    });
  }

  loadConfig = async (userConfig) => {
    const {testConfig, onConfigLoad, defaultConfig} = this.props;
    try {
      if(userConfig) {

        let latestUserConfigVersion = _.find(userConfig._versions, {_version: userConfig._tipVersion})
        let _userData = JSON.parse(latestUserConfigVersion._userData)

        _userData._id = userConfig._id;

        const routes = await testConfig(_userData);

        if (this.state.remember) {
          this.saveChoice(_userData)
        } else {
          this.clearSavedChoice();
        }

        onConfigLoad(_userData, routes);
      }else{
        onConfigLoad(defaultConfig, testConfig(defaultConfig));
      }
    } catch (e) {
      console.log(e);
      onConfigLoad(defaultConfig, testConfig(defaultConfig));
    }
  }

  loadProject = async (project) => {
    let userConfigs = [];

    let { projectUserGroups, selectedUserGroupId } = this.state;
    let selectedUserGroup = _.filter(projectUserGroups, u => u._id === selectedUserGroupId)[0];
    if(!selectedUserGroup && projectUserGroups) {
        selectedUserGroup = projectUserGroups[0];
    }
    if(!selectedUserGroup) {
      userConfigs = await IafProj.getUserConfigs(project, {_userType: this.props.configUserType});
    }else {
      userConfigs.push(selectedUserGroup.userConfig);
    }

    if (userConfigs) {
      if (userConfigs.length > 1) {
        console.warn('There are ' + userConfigs.length + ' user configs found');
      }
      return this.loadConfig(userConfigs[0]);
    } else {
        return this.loadConfig();
    }
  }

  onRememberChange = (event) => {
    this.setState({remember: event.target.checked})
  }

  onProjectPicked = async (selectedOption) => {
    const projectId = selectedOption.value;
    this.setState({showLoadButton: false, projectUserGroups:[], userGroupOptions: []});
    const {projects} = this.state;

    let projectUserGroups = this.state.appUserGroups[projectId]
    let selectedUserGroupId = this.state.appUserGroups[projectId][0]._id

    const selectUserGroupOptions = this.getUserGroupOptions(projectId)

    this.setState({selectedProjectId: projectId, showLoadButton: true,
      projectUserGroups: projectUserGroups,
      userGroupOptions: selectUserGroupOptions,
      userGroupValue: selectUserGroupOptions[0],
      selectedUserGroupId: selectedUserGroupId});
  }

  onUserGroupPicked = (selectedOption) => {
    const selectedUserGroupId = selectedOption.value;
    this.setState({selectedUserGroupId: selectedUserGroupId, userGroupValue: selectedOption});
    console.log("selectedOption", selectedOption)
    console.log("selectedUserGroupId",selectedUserGroupId)
    window.localStorage.setItem("selectedUserGroup", selectedOption.label);
    window.localStorage.setItem("selectedUserGroupId",selectedUserGroupId)
  }

  submitProjSelection = async () => {
    const {appContextProps, projects} = this.props;
    for (const project of projects) {
      if (project._id === this.state.selectedProjectId) {
        await IafProj.switchProject(project._id);
        let currProject = await IafProj.getCurrent();
        await this.loadProject(project);

        sessionStorage.setItem(PROJECT_ID_KEY, project._id)
        appContextProps.actions.setSelectedItems({selectedProject: currProject, selectedUserGroupId: this.state.selectedUserGroupId});
        window.location.hash = '/'; //Since we're outside the react router scope, we need to deal with the location object directly

        if (this.props.referenceAppConfig?.refApp) {
          window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        }
        return;
      }
    }
  }

  acceptInvite = (invite) => {
    let inviteStatus = {...this.state.inviteStatus}
    inviteStatus[invite._id] = "Accepting..."
    this.setState({inviteStatus})
    IafUserGroup.addUserToGroupByInvite(invite._usergroup, invite)
      .then((r) => {
        this.updateInviteStatus(invite, "Accepted");
        this.props.onAcceptInvite();
      })
      .catch(e => this.inviteFailed(invite, e))
  }

  rejectInvite = (invite) => {
    let inviteStatus = {...this.state.inviteStatus}
    inviteStatus[invite._id] = "Rejecting..."
    this.setState({inviteStatus})
    // console.log(invite)
    IafUserGroup.rejectInvite(invite._usergroup, invite._id)
      .then(r => this.updateInviteStatus(invite, "Rejected"))
      .catch(e => this.inviteFailed(e))
  }

  updateInviteStatus = (invite, status) => {
    let invites = this.state.invites.filter(inv => inv._id != invite._id)
    let inviteStatus = {...this.state.inviteStatus}
    inviteStatus[invite._id] = status
    this.setState({invites, inviteStatus})
  }

  inviteFailed = (invite, e) => {
    console.error(e)
    let inviteStatus = {...this.state.inviteStatus}
    inviteStatus[invite._id] = "Failed: " + e.message
    this.setState({invites, inviteStatus})
  }

  render() {
    const {appContextProps, onCancel} = this.props;
    const {projects, remember, projectUserGroups, showLoadButton, invites} = this.state;
    const loadBtn = showLoadButton ? (<div>
          <div className='custom-control custom-switch' style={{marginTop: '15px', zIndex: '0'}}>
                <input type="checkbox" className="custom-control-input" id="remswitch" value={remember} checked={remember} onChange={this.onRememberChange.bind(this)}/>
                <label className="custom-control-label" htmlFor="remswitch">Remember my choice</label>
          </div>
          <div className='button-container'>
          {this.props.referenceAppConfig?.refApp &&
          <button 
            onClick={()=>this.props.userLogout()} 
            className={this.props.referenceAppConfig?.refApp ? "cancel" : "default-cancel"}
          >
            Logout
          </button>
          }
          <button
            onClick={onCancel}
            className={
              this.props.referenceAppConfig?.refApp ? "cancel" : "default-cancel"
            }
          >
            Cancel
          </button>
          <button
            onClick={this.submitProjSelection}
            className={
              this.props.referenceAppConfig?.refApp ? "load" : "default-load"
            }
          >
            Load Project
          </button>
          {this.props.referenceAppConfig?.refApp && (
            <button onClick={() => this.props.referenceAppCreateProject()} className="setup">
              Create Project
            </button>
          )}
          </div>
        </div>
      ) : <div className="spinningLoadingIcon projectLoadingIcon"></div>;
    //TODO handle user modal manual close -> load default config
    const selectProjectOptions = (!projects || projects.length == 0) ? [{value: 'none', label: ''}] :
        projects.map((project) => {return {'value': project._id, 'label': project._name}});

    //We don't want to always set the selects to the first option.
    //We want to be able to display the last choices the user made in the dialog.
    //So we default to the first option, but if we find selectedItems in the appContext we use them
    //to open the dialog with settings they last chose
    let defaultProjectOption = selectProjectOptions[0];
    if (this.state.selectedProjectId) defaultProjectOption = _.find(selectProjectOptions, {value: this.state.selectedProjectId})

    let currentInvites = invites && invites.filter(inv => inv._status == "PENDING")
    let expiredInvites = invites && invites.filter(inv => inv._status == "EXPIRED")

    const buildInviteTable = (invites, expired) => <SimpleTable
        className="invite-table"
        header = { expired ? ["", "Expired Invites", "Role", ""] : ["", "Project", "Role", ""]}
        rows={invites.map(inv => {
          let status = this.state.inviteStatus[inv._id]
          let statusOrButtons =
            status
              ? <span className={"invite-state-"+status.toLowerCase()}>{status}</span>
              : <div>
                  { expired  ? "" : <span className='invite-action' onClick={e=>this.acceptInvite(inv)}><i className="fa fa-check"></i> Accept Invite</span> }
                  <span className='invite-action' onClick={e=>this.rejectInvite(inv)}><i className="fa fa-times"></i> {expired ? "Remove" : "Reject"} Invite</span>
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
              (!this.state.loadingModal && (!projects || projects.length === 0)) &&
              <div>
                You are not yet a member of any projects, please
                {(!currentInvites || currentInvites.length === 0) && <span> contact your project admin for an invite</span>}

                {this.props.referenceAppConfig?.refApp && this.state.user?.has_access && (
                  <div>
            <button onClick={() => this.props.referenceAppCreateProject()} className="setup">
              Create Project
            </button>
            <button onClick={()=>this.props.userLogout()}>
            Logout
          </button>
          </div>
          )}
                {(currentInvites && currentInvites.length > 0) && <span> accept an invite</span>}
              </div>
            }

            {this.state.loadingModal && <SimpleTextThrobber throbberText="Loading your project information" />}
            {this.props.referenceAppConfig?.refApp &&
            !showLoadButton &&
            !this.state.loadingModal &&
            !this.state.user?.has_access ? (
              <>
                <br />
                <div>
                  <span className="text-danger">
                    You don't have permission to create a project in the Reference App.
                    Please contact the Admin.
                  </span>
                </div>
                <button onClick={()=>this.props.userLogout()}>
                  Logout
                </button>
              </>
            ) : (
              <></>
            )}

             {/* {this.props.referenceAppConfig?.refApp &&
              !showLoadButton &&
              !this.state.loadingModal && (
                <>
                  {" "}
                  <button
                    onClick={() => {
                      if (!this.state.user?.has_access) {
                        return;
                      }
                      this.props.referenceAppCreateProject();
                    }}
                    className={
                      this.state.user?.has_access ? "setup" : "disabled"
                    }
                    disabled={!this.state.user?.has_access}
                  >
                    Create Project
                  </button>
                </>
              )} */}


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
              !this.state.loadingModal && projects && projects.length > 0 &&
              <div>
                <h4>Project</h4>
                <Select
                    name="projectSelect"
                    options={selectProjectOptions}
                    defaultValue={defaultProjectOption}
                    className={this.props.referenceAppConfig?.refApp ? "custom-single-class" : "basic-single"}
                    classNamePrefix="select"
                    placeholder={'Select Project...'}
                    onChange={this.onProjectPicked.bind(this)}
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
                        options={this.state.userGroupOptions}
                        value={this.state.userGroupValue}
                        className={this.props.referenceAppConfig?.refApp ? "custom-single-class" : "basic-single"}
                        classNamePrefix="select"
                        placeholder={'Select User Group...'}
                        onChange={this.onUserGroupPicked.bind(this)}
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
}

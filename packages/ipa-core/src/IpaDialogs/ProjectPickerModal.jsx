import React from 'react';
import Select from 'react-select';
import {IafProj, IafUserGroup, IafHelper, IafSession, IafPassSvc} from '@invicara/platform-api';
import _ from 'lodash';
import GenericModal from "./GenericModal";
import SimpleTable from "../IpaControls/SimpleTable"

import './ProjectPickerModal.scss'
import '../IpaControls/SpinningLoadingIcon.scss'

const PROJECT_ID_KEY = "ipaSelectedProjectId"

export default class ProjectPickerModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedProjectId: null,
      selectedUserGroupId: null,
      remember: true,
      projectUserGroups: [],
      showLoadButton: false,
      inviteStatus: {}
    };
  }

  checkUserConfigs = async (selectedProject) => {
    let ctx = {_namespaces: selectedProject._namespaces};
    let userGroups = await IafProj.getUserGroupsForCurrentUser(selectedProject, ctx);
    let selectedUserGroupId = null;
    let userGroupsWithConfig = [];
    //Check if there are more than one user groups with user configs of this _userType
    if (userGroups) {
      await IafHelper.asyncForEach(userGroups, async ug => {
        let configs = await IafUserGroup.getUserConfigs(ug, {_userType: this.props.configUserType}, ctx)
            .catch(e => console.log("ignoring this usergroup", ug._description, "reason", e));
        if (configs && configs.length > 0) {
          ug.userConfig = configs[0];
          userGroupsWithConfig.push(ug);
        }
      });

      if(userGroupsWithConfig.length === 1){
        selectedUserGroupId = userGroupsWithConfig[0]._id;
      }
    }
    return {userGroupsWithConfig: userGroupsWithConfig, selectedUserGroupId: selectedUserGroupId};
  }

  componentDidMount = async () => {

    this.loadModal();

  }

  componentDidUpdate = async (prevProps, prevState) => {

    if (this.props.projects !== prevProps.projects)
      this.loadModal();

  }

  loadModal = async () => {

    const {projects} = this.props;
    this.getInvites()
    if(projects && projects.length > 0) {

      let res, projectid, usergroupid;
      if (!this.props.appContextProps.selectedItems.selectedProject){
          IafSession.setSessionStorage('project', {_namespaces: _.get(projects, '0._namespaces')});
          res = await this.checkUserConfigs(projects[0]);
          projectid = projects[0]._id;
          usergroupid = res.selectedUserGroupId;
      }
      else {
          res = await this.checkUserConfigs(this.props.appContextProps.selectedItems.selectedProject);

          projectid = this.props.appContextProps.selectedItems.selectedProject._id;

          if(this.state.selectedUserGroupId && projectid == this.state.selectedProjectId){
            usergroupid = this.state.selectedUserGroupId;
          }else if (this.props.appContextProps.selectedItems.selectedUserGroupId)
            usergroupid = this.props.appContextProps.selectedItems.selectedUserGroupId;
          else
            usergroupid = res.selectedUserGroupId;
      }

      this.setState({selectedProjectId: projectid, showLoadButton: true,
        projectUserGroups: res.userGroupsWithConfig ? res.userGroupsWithConfig : [],
        selectedUserGroupId: usergroupid});
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

  loadConfig = (userConfig) => {
    const {testConfig, onConfigLoad, defaultConfig} = this.props;
    try {
      if(userConfig) {
        let _userData = JSON.parse(_.get(userConfig, '_versions.0._userData'));
        _userData._id = userConfig._id;

        const routes = testConfig(_userData);

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
      userConfigs = await IafProj.getUserConfigs(project, {_userType: ConfigUserType});
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
    this.setState({showLoadButton: false, projectUserGroups:[]});
    const {projects} = this.props;
    const selectedProject = _.filter(projects, p => p._id === projectId)[0];

    let res = await this.checkUserConfigs(selectedProject);
    this.setState({selectedProjectId: projectId, showLoadButton: true,
      projectUserGroups: res.userGroupsWithConfig ? res.userGroupsWithConfig : [],
      selectedUserGroupId: res.selectedUserGroupId});
  }

  onUserGroupPicked = (selectedOption) => {
    const selectedUserGroupId = selectedOption.value;
    this.setState({selectedUserGroupId: selectedUserGroupId});
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
    const {projects, appContextProps, onCancel} = this.props;
    const {remember, projectUserGroups, showLoadButton, invites} = this.state;
    const loadBtn = showLoadButton ? <div>
          <div className='custom-control custom-switch' style={{marginTop: '15px', zIndex: '0'}}>
                <input type="checkbox" className="custom-control-input" id="remswitch" value={remember} checked={remember} onChange={this.onRememberChange.bind(this)}/>
                <label className="custom-control-label" htmlFor="remswitch">Remember my choice</label>
          </div>
          <button onClick={onCancel} className="cancel">Cancel</button>
          <button onClick={this.submitProjSelection} className="load">Load Project</button>
          </div>
         : <div className="spinningLoadingIcon projectLoadingIcon"></div>;
    //TODO handle user modal manual close -> load default config
    const selectProjectOptions = (!projects || projects.length == 0) ? [{value: 'none', label: ''}] :
        projects.map((project) => {return {'value': project._id, 'label': project._name}});
    const selectUserGroupOptions = projectUserGroups ? projectUserGroups.map((ug) => {return {'value': ug._id, 'label': ug._name}}) : [];

    //We don't want to always set the selects to the first option.
    //We want to be able to display the last choices the user made in the dialog.
    //So we default to the first option, but if we find selectedItems in the appContext we use them
    //to open the dialog with settings they last chose
    let defaultProjectOption = selectProjectOptions[0];
    if (appContextProps.selectedItems.selectedProject) {
        defaultProjectOption = {'value': appContextProps.selectedItems.selectedProject._id, 'label': appContextProps.selectedItems.selectedProject._name};
    }

    let defaultUserGroupOption = selectUserGroupOptions[0];
    if (appContextProps.selectedItems.selectedUserGroupId) {
        let foundUserGroup = _.filter(selectUserGroupOptions, ug => ug.value === appContextProps.selectedItems.selectedUserGroupId)[0];
        if (foundUserGroup)
            defaultUserGroupOption = foundUserGroup;
    }

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
              (!projects || projects.length === 0) &&
              <div>
                You are not yet a member of any projects, please
                {(!invites || invites.length === 0) && <span> contact your project admin for an invite</span>}
                {(invites && invites.length > 0) && <span> accept an invite</span>}
              </div>
            }

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
              projects && projects.length > 0 &&
              <div>
                <h4>Project</h4>
                <Select
                    name="projectSelect"
                    options={selectProjectOptions}
                    defaultValue={defaultProjectOption}
                    className="basic-single"
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
                        options={selectUserGroupOptions}
                        defaultValue={defaultUserGroupOption}
                        className="basic-single"
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

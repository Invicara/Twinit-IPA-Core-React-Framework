import React from "react";
import _ from "lodash";

import { IafPassSvc, IafProj, IafUserGroup } from "@dtplatform/platform-api";

import { UserGroup } from "./UserGroup";

import "./UserGroupView.scss";

class UserGroupView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pageModes: ["UserGroups", "Users"],
      pageMode: "UserGroups",
      userGroupModes: ["Users/Invites", "Permissions"],
      userGroupMode: "Users/Invites",
      allUserGroupNamesUpper: [], //list of uppercase usergroup names for easy comparisons
      invalidUserGroups: [], //userGroups on the project the user can't interact with
      userGroups: [], //userGroups on the project the user can interact with
      selectedUserGroup: null, //the currently selected UserGroup
      editingUserGroup: false, //if the user is editng the UserGroup
      userGroupNameEdit: "", //the editable UserGroup name
      savingUserGroup: false, //if we are saving the UserGroup to the platform
      userGroupNameEditError: null, //any error with the UserGroup name
      usersInSelectedGroup: [], //user who are in the currently selected UserGroup
      loadingInvites: true, //whether we are loading invites for usergroup or user
      invitesInSelectedGroup: [], //pending invites in a group
      expiredInvitesInSelectedGroup: [], //expired invites in a group
      users: [], //list of all users in the project
      selectedUser: null, //the currently selected user
      userGroupsForSelectedUser: [], //the valid usergroups to which the selected user belongs
      invitesForSelectedUser: [], //invites for the seleted user
      expiredInvitesForSelectedUser: [], //expired invites for the selected user
    };

    this._loadAsyncData = this._loadAsyncData.bind(this);
    this.onModeChange = this.onModeChange.bind(this);
    this.onUserGroupModeChange = this.onUserGroupModeChange.bind(this);
    this.getAllUserGroups = this.getAllUserGroups.bind(this);
    this.setSelectedUserGroup = this.setSelectedUserGroup.bind(this);
    this.toggleUserGroupEditable = this.toggleUserGroupEditable.bind(this);
    this.onUserGroupNameChange = this.onUserGroupNameChange.bind(this);
    this.updateUserGroup = this.updateUserGroup.bind(this);
    this.sortGroupsBasedOnConfig = this.sortGroupsBasedOnConfig.bind(this);
    this.loadUserGroupData = this.loadUserGroupData.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.setSelectedUser = this.setSelectedUser.bind(this);
    this.loadUserData = this.loadUserData.bind(this);
    this.updateCurrentView = this.updateCurrentView.bind(this);
    this.onCancelInvite = this.onCancelInvite.bind(this);
    this.onResendInvite = this.onResendInvite.bind(this);
    this.onAcceptInvite = this.onAcceptInvite.bind(this);
    this.canRemoveUser = this.canRemoveUser.bind(this);
    this.removeUser = this.removeUser.bind(this);
  }

  async componentDidMount() {
    if (
      this.props.handler.config.defaultView &&
      this.props.handler.config.defaultView.toUpperCase() === "USERS"
    )
      this.setState({ pageMode: "Users" }, this._loadAsyncData);
    else this.setState({ pageMode: "UserGroups" }, this._loadAsyncData);

    this.props.onLoadComplete();
  }

  async _loadAsyncData() {
    await this.getAllUserGroups();
    this.getAllUsers();
  }

  onModeChange(e) {
    this.setState({ pageMode: e.target.value, editingUserGroup: false });
    if (e.target.value === "UserGroups") this.loadUserGroupData();
  }

  onUserGroupModeChange(e) {
    this.setState({ userGroupMode: e.target.value }, this.loadUserGroupData);
  }

  sortGroupsBasedOnConfig(groups, configs) {
    //determines whether a group has a config matching one in configs
    function hasMatchingConfig(group, configs) {
      let match = false;
      for (let i = 0; i < configs.length; i++) {
        if (
          _.find(group._userAttributes.userConfigs, { _id: configs[i]._id })
        ) {
          match = true;
          break;
        }
      }

      return match;
    }

    groups.sort((a, b) => {
      return a._name.localeCompare(b._name);
    });

    //further filter down to just the userGroups with a userConfig for this application
    let groupsWithAppUserConfig = groups.filter((g) =>
      hasMatchingConfig(g, configs),
    );

    //get the list of userGroups in the project with out config for this app
    let invalidGroups = groups.filter((g) => {
      return !g._userAttributes.userConfigs || !hasMatchingConfig(g, configs);
    });

    return {
      validGroups: groupsWithAppUserConfig,
      invalidGroups: invalidGroups,
    };
  }

  async getAllUserGroups(selectedUserGroup) {
    return new Promise((resolve, reject) => [
      IafProj.getUserGroups(this.props.selectedItems.selectedProject).then(
        async (groups) => {
          //get all user configs int he project for this application (ie. _userType)
          IafProj.getUserConfigs(this.props.selectedItems.selectedProject, {
            query: {
              _userType: this.props.selectedItems.ipaConfig.configUserType,
            },
          }).then((userConfigs) => {
            //get valid and invalid groups
            let sortedUserGroups = this.sortGroupsBasedOnConfig(
              groups,
              userConfigs,
            );

            let allUserGroupNamesUpper = groups.map((g) =>
              g._name.toUpperCase(),
            );

            let applySelectedUserGroup = selectedUserGroup
              ? selectedUserGroup
              : sortedUserGroups.validGroups[0];

            this.setState(
              {
                allUserGroupNamesUpper: allUserGroupNamesUpper,
                invalidUserGroups: sortedUserGroups.invalidGroups,
                userGroups: sortedUserGroups.validGroups,
              },
              this.setSelectedUserGroup(applySelectedUserGroup),
            );

            resolve(applySelectedUserGroup);
          });
        },
      ),
    ]);
  }

  setSelectedUserGroup(ug) {
    this.setState(
      {
        selectedUserGroup: ug,
        usersInSelectedGroup: [],
        invitesInSelectedGroup: [],
        expiredInvitesInSelectedGroup: [],
      },
      this.loadUserGroupData,
    );
  }

  loadUserGroupData() {
    if (this.state.userGroupMode === "Users/Invites") {
      this.setState({
        loadingInvites: true,
        usersInSelectedGroup: [],
        invitesInSelectedGroup: [],
        expiredInvitesInSelectedGroup: [],
      });
      IafUserGroup.getUsers(this.state.selectedUserGroup, null, {
        _offset: 0,
        _pageSize: 200,
      }).then((users) => {
        users.sort((a, b) => {
          return a._lastname.localeCompare(b._lastname);
        });
        this.setState({ usersInSelectedGroup: users });
      });

      IafUserGroup.getInvites(this.state.selectedUserGroup).then((invites) => {
        let pendingInvites = invites._list.filter(
          (i) => i._status === "PENDING",
        );
        let expiredInvites = invites._list.filter(
          (i) => i._status === "EXPIRED",
        );

        this.setState({
          invitesInSelectedGroup: pendingInvites,
          expiredInvitesInSelectedGroup: expiredInvites,
          loadingInvites: false,
        });
      });
    }
  }

  toggleUserGroupEditable(e) {
    if (e) e.preventDefault();
    this.setState({
      userGroupNameEdit: this.state.selectedUserGroup._name,
      editingUserGroup: !this.state.editingUserGroup,
      userGroupNameEditError: null,
    });
  }

  onUserGroupNameChange(e) {
    this.setState({ userGroupNameEditError: null });
    if (e.target.value) {
      if (e.target.value.length < 50) {
        this.setState({ userGroupNameEdit: e.target.value });

        if (!e.target.value.length)
          this.setState({
            userGroupNameEditError:
              "UserGroup name is not allowed to be blank!",
          });
      } else if (e.target.value.length > 50) {
        let truncName = e.target.value.slice(0, 50);
        this.setState({ userGroupNameEdit: truncName });
      }
    } else {
      this.setState({ userGroupNameEdit: "" });
      this.setState({
        userGroupNameEditError: "UserGroup name is not allowed to be blank!",
      });
    }
  }

  //currently we only update the usergroup's name
  updateUserGroup(e) {
    e.preventDefault();

    if (
      !this.state.allUserGroupNamesUpper.includes(
        this.state.userGroupNameEdit.toUpperCase(),
      )
    ) {
      this.setState({ savingUserGroup: true });
      let updatedGroup = Object.assign({}, this.state.selectedUserGroup, {
        _name: this.state.userGroupNameEdit,
      });

      IafUserGroup.update(updatedGroup)
        .then((resGroup) => {
          this.toggleUserGroupEditable();
          this.setState({
            savingUserGroup: false,
            userGroups: [],
            invalidGroups: [],
            selectedUserGroup: null,
          });
          this.getAllUserGroups(resGroup);
        })
        .catch((err) => {
          console.error("error saving usergroup change", err);
          this.setState({ userGroupNameEditError: err.message });
        });
    } else {
      this.setState({
        userGroupNameEditError:
          "Duplicate UserGroup name! Please choose a different name.",
      });
    }
  }

  getAllUsers() {
    IafProj.getUsers(this.props.selectedItems.selectedProject).then(
      (allUsers) => {
        allUsers.sort((a, b) => {
          return a._lastname.localeCompare(b._lastname);
        });

        this.setState(
          { users: allUsers, selectedUser: allUsers[0] },
          this.loadUserData,
        );
      },
    );
  }

  setSelectedUser(ug) {
    this.setState(
      {
        selectedUser: ug,
        userGroupsForSelectedUser: [],
        invitesForSelectedUser: [],
      },
      this.loadUserData,
    );
  }

  async loadUserData() {
    this.setState({
      loadingInvites: true,
      userGroupsForSelectedUser: [],
      invitesForSelectedUser: [],
      expiredInvitesForSelectedUser: [],
    });

    let ugresults = await Promise.all(
      this.state.userGroups.map((ug) => {
        return IafUserGroup.getUsers(ug, null, {
          _offset: 0,
          _pageSize: 200,
        }).then((users) => {
          if (_.find(users, { _id: this.state.selectedUser._id })) return ug;
          else return null;
        });
      }),
    );

    ugresults = ugresults.filter((u) => u);

    this.setState({ userGroupsForSelectedUser: ugresults });

    let invresults;
    //if currentUser is selected get the user's invites
    if (this.props.user._id === this.state.selectedUser._id) {
      invresults = await IafPassSvc.getUserInvites();
    } else {
      //we have to do a similar workaround for invites because there is no access
      //to fetch invites by another user so we have go usergroup by usergroup
      invresults = await Promise.all(
        this.state.userGroups.map((ug) => {
          return IafUserGroup.getInvites(ug).then((invs) => {
            return _.filter(invs._list, {
              _email: this.state.selectedUser._email,
            });
          });
        }),
      );
    }

    invresults = _.flatten(invresults);
    invresults = invresults.filter((i) => i);
    let validInvites = invresults.filter((i) => i._status === "PENDING");
    let expiredInvites = invresults.filter((i) => i._status === "EXPIRED");

    this.setState({
      invitesForSelectedUser: validInvites,
      expiredInvitesForSelectedUser: expiredInvites,
      loadingInvites: false,
    });
  }

  async onCancelInvite(invite) {
    let result = await IafUserGroup.cancelInvite(invite._usergroup, invite._id);

    this.updateCurrentView();
  }

  async onResendInvite(invite) {
    //cancel the original invite
    let cancelResult = await IafUserGroup.cancelInvite(
      invite._usergroup,
      invite._id,
    );

    let inviteData = [
      {
        _email: invite._email,
        _params: invite._params,
      },
    ];

    //send a new invite
    let inviteResult = await IafUserGroup.inviteUsersToGroup(
      invite._usergroup,
      inviteData,
    );

    this.updateCurrentView();
  }

  async onAcceptInvite(invite) {
    IafUserGroup.addUserToGroupByInvite(invite._usergroup, invite)
      .then((r) => {
        this._loadAsyncData();
      })
      .catch((e) => console.error("error accepting invite: ", e));
  }

  async canRemoveUser(user = false, group = false) {
    //if user is passed we are in usergroup mode
    //so we have a selectedUserGroup
    if (user) {
      if (
        this.state.selectedUserGroup._id ===
          this.props.selectedItems.selectedUserGroupId &&
        user._id === this.props.user._id
      )
        return {
          allow: false,
          message: "You can't remove your user from the current UserGroup",
        };
      else if (this.state.usersInSelectedGroup.length === 1)
        return {
          allow: false,
          message: "You can't remove the last User from a UserGroup",
        };
      else if (user._id === this.props.user._id)
        return {
          allow: true,
          message:
            "Are you sure you want to remove yourself from this UserGroup?",
        };
      else
        return {
          allow: true,
          message: "Confirm Remove User from Group",
        };
    } else if (group) {
      //otherwise we are in user mode
      //so we have a selectedUser
      if (
        group._id === this.props.selectedItems.selectedUserGroupId &&
        this.state.selectedUser._id === this.props.user._id
      )
        return {
          allow: false,
          message: "You can't remove your user from the current UserGroup",
        };
      else {
        let users = await IafUserGroup.getUsers(group, null, {
          _offset: 0,
          _pageSize: 200,
        });

        if (users.length === 1)
          return {
            allow: false,
            message: "You can't remove the last User from a UserGroup",
          };
        else if (this.state.selectedUser._id === this.props.user._id)
          return {
            allow: true,
            message:
              "Are you sure you want to remove yourself from this UserGroup?",
          };
        else
          return {
            allow: true,
            message: "Confirm Remove User from Group",
          };
      }
    }
  }

  async removeUser(user = false, group = false) {
    let removeUser, fromGroup;

    if (user) {
      removeUser = user;
      fromGroup = this.state.selectedUserGroup;
    } else {
      removeUser = this.state.selectedUser;
      fromGroup = group;
    }

    let canRemove;
    if (this.state.pageMode === "UserGroups")
      canRemove = await this.canRemoveUser(removeUser);
    else canRemove = await this.canRemoveUser(null, fromGroup);

    if (canRemove) {
      IafUserGroup.deleteUserFromGroup(fromGroup, removeUser).then((result) => {
        //if in usermode and we are removing the last usergroup for user
        //reload everything as the user will need to disappear from the user list
        if (
          this.state.pageMode === "Users" &&
          this.state.userGroupsForSelectedUser.length === 1
        )
          this._loadAsyncData();
        else this.updateCurrentView();
      });
    }
  }

  updateCurrentView() {
    if (this.state.pageMode === "UserGroups") this.loadUserGroupData();
    else this.loadUserData();
  }

  render() {
    return (
      <UserGroup
        props={this.props}
        state={this.state}
        updateCurrentView={this.updateCurrentView}
        onModeChange={this.onModeChange}
        setSelectedUserGroup={this.setSelectedUserGroup}
        setSelectedUser={this.setSelectedUser}
        toggleUserGroupEditable={this.toggleUserGroupEditable}
        onUserGroupModeChange={this.onUserGroupModeChange}
        onUserGroupNameChange={this.onUserGroupNameChange}
        updateUserGroup={this.updateUserGroup}
        canRemoveUser={this.canRemoveUser}
        removeUser={this.removeUser}
        onCancelInvite={this.onCancelInvite}
        onResendInvite={this.onResendInvite}
        onAcceptInvite={this.onAcceptInvite}
      />
    );
  }
}

export default UserGroupView;

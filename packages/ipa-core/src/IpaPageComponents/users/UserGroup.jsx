import React, { useState } from "react";
import clsx from "clsx";

import { StackableDrawer } from "../../IpaDialogs/StackableDrawer";
import RadioButtons from "../../IpaControls/RadioButtons";
import SimpleTextThrobber from "../../IpaControls/SimpleTextThrobber";

import { GroupCard } from "./GroupCard";
import { UserCard } from "./UserCard";
import { InviteCard } from "./InviteCard";
import { InviteForm } from "./InviteForm";

import { UserGroupPermissionTable } from "./UserGroupPermissionTable";

import "./UserGroupView.scss";

export const UserGroup = ({
  props,
  state,
  updateCurrentView,
  onModeChange,
  setSelectedUserGroup,
  setSelectedUser,
  toggleUserGroupEditable,
  onUserGroupModeChange,
  onUserGroupNameChange,
  updateUserGroup,
  canRemoveUser,
  removeUser,
  onCancelInvite,
  onResendInvite,
  onAcceptInvite,
}) => {
  return (
    <div className="user-group-view">
      {props.handler.config.allowUserGroupInvite && (
        <StackableDrawer
          level={1}
          iconKey="fas fa-user-plus"
          isDrawerOpen={false}
        >
          <InviteForm
            appName={props.selectedItems.ipaConfig.appName}
            appUrl={props.handler.config.appUrl}
            currentUser={props.user}
            users={state.users}
            userGroups={state.userGroups}
            project={props.selectedItems.selectedProject}
            onInvitesSent={updateCurrentView}
          />
        </StackableDrawer>
      )}

      <StackableDrawer
        level={props.handler.config.allowUserGroupInvite ? 2 : 1}
        iconKey="fas fa-users"
        isDrawerOpen={true}
      >
        <div className="switchable-list-view">
          <div className="list-header">
            <div className="radio-btns">
              <RadioButtons
                options={state.pageModes}
                value={state.pageMode}
                onChange={onModeChange}
                labelPlacement="end"
              />
            </div>
          </div>
          <hr />
          {state.pageMode === "UserGroups" && (
            <div>
              {!state.selectedUserGroup && (
                <SimpleTextThrobber throbberText="Loading UserGroups" />
              )}
              <ul className="user-group-list">
                {state.userGroups.map((u) => (
                  <GroupCard
                    key={u._id}
                    group={u}
                    selectable={true}
                    isSelected={u._id === state.selectedUserGroup._id}
                    onClick={(e) => setSelectedUserGroup(u)}
                  />
                ))}
              </ul>
              {state.invalidUserGroups.length > 0 && (
                <div className="other-groups">
                  <span>Other Groups</span>
                  <ul className="other-group-list">
                    {state.invalidUserGroups.map((u) => (
                      <GroupCard key={u._id} group={u} disabled={true} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {state.pageMode === "Users" && (
            <div>
              {!state.selectedUser && (
                <SimpleTextThrobber throbberText="Loading Users" />
              )}
              <ul className="user-group-list">
                {state.users.map((u) => (
                  <UserCard
                    key={u._id}
                    user={u}
                    isCurrentUser={u._id === props.user._id}
                    selectable={true}
                    isSelected={u._id === state.selectedUser._id}
                    onClick={(e) => setSelectedUser(u)}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </StackableDrawer>

      {state.pageMode === "UserGroups" && (
        <div className="usergroup-mode-view">
          <div className="row1">
            {!state.editingUserGroup && (
              <div className="usergroup-info">
                <div className="usergroup-name">
                  <h1>
                    {state.selectedUserGroup
                      ? state.selectedUserGroup._name
                      : ""}
                  </h1>
                  {props.handler.config.allowUserGroupEdit &&
                    state.selectedUserGroup && (
                      <span className="ug-btn">
                        <a href="#" onClick={toggleUserGroupEditable}>
                          edit
                        </a>
                      </span>
                    )}
                </div>
                {props.handler.config.allowViewPermissions && (
                  <div>
                    <RadioButtons
                      options={state.userGroupModes}
                      value={state.userGroupMode}
                      onChange={onUserGroupModeChange}
                      labelPlacement="end"
                    />
                  </div>
                )}
              </div>
            )}
            {state.editingUserGroup && (
              <div>
                <div className="usergroup-name editable">
                  <h1>
                    <input
                      className="usergroup-name-input"
                      type="text"
                      disabled={state.savingUserGroup}
                      value={state.userGroupNameEdit}
                      onChange={onUserGroupNameChange}
                    />
                  </h1>
                  <span className="ug-btn">
                    {!state.savingUserGroup &&
                      !state.userGroupNameEditError && (
                        <a href="#" onClick={updateUserGroup}>
                          save
                        </a>
                      )}
                    {(state.savingUserGroup ||
                      state.userGroupNameEditError) && (
                      <span className="disabled-ug-btn">save</span>
                    )}
                  </span>
                  <span className="ug-btn">
                    {!state.savingUserGroup && (
                      <a href="#" onClick={toggleUserGroupEditable}>
                        cancel
                      </a>
                    )}
                    {state.savingUserGroup && (
                      <span className="disabled-ug-btn">cancel</span>
                    )}
                  </span>
                </div>
                {state.userGroupNameEditError && (
                  <div className="usergroup-name-error">
                    {state.userGroupNameEditError}
                  </div>
                )}
              </div>
            )}
          </div>

          <hr />

          {state.userGroupMode === "Users/Invites" && (
            <div className="row2">
              <div className="usergroup-members">
                <div>
                  <h3>Members</h3>
                </div>
                {state.usersInSelectedGroup.length === 0 && (
                  <div className="throbber">
                    <SimpleTextThrobber throbberText="Loading UserGroup Members" />
                  </div>
                )}
                <ul className="group-users-list">
                  {state.usersInSelectedGroup.map((u) => (
                    <UserCard
                      key={u._id}
                      user={u}
                      isCurrentUser={u._id === props.user._id}
                      showActions={props.handler.config.allowManageUsers}
                      canRemoveUser={canRemoveUser}
                      onRemoveUser={removeUser}
                    />
                  ))}
                </ul>
              </div>
              <div className="usergroup-invites">
                <div>
                  <h3>Invites</h3>
                </div>
                {state.loadingInvites && (
                  <div className="throbber">
                    <SimpleTextThrobber throbberText="Loading UserGroup Invites" />
                  </div>
                )}
                {!state.loadingInvites &&
                  state.invitesInSelectedGroup.length === 0 && (
                    <span className="indent-header">No pending invites</span>
                  )}
                <ul>
                  {state.invitesInSelectedGroup.map((i) => (
                    <InviteCard
                      key={i._id}
                      invite={i}
                      isCurrentUser={i._email === props.user._email}
                      existingUser={_.find(state.users, {
                        _email: i._email,
                      })}
                      showActions={props.handler.config.allowManageInvites}
                      onCancelInvite={onCancelInvite}
                      onResendInvite={onResendInvite}
                      onAcceptInvite={onAcceptInvite}
                    />
                  ))}
                </ul>
                {state.expiredInvitesInSelectedGroup.length > 0 && (
                  <div>
                    <span className="indent-header">Expired Invites</span>
                    <ul>
                      {state.expiredInvitesInSelectedGroup.map((i) => (
                        <InviteCard
                          key={i._id}
                          invite={i}
                          isCurrentUser={i._email === props.user._email}
                          existingUser={_.find(state.users, {
                            _email: i._email,
                          })}
                          showActions={props.handler.config.allowManageInvites}
                          onCancelInvite={onCancelInvite}
                          onResendInvite={onResendInvite}
                          onAcceptInvite={onAcceptInvite}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {state.userGroupMode === "Permissions" && (
            <div className="row2 table">
              <UserGroupPermissionTable
                usergroup={state.selectedUserGroup}
                allowManagePermissions={
                  props.handler.config.allowManagePermissions
                }
                itemFetchScript={props.handler.config.scripts?.itemFetchScript}
              />
            </div>
          )}
        </div>
      )}

      {state.pageMode === "Users" && (
        <div className="user-mode-view">
          <div className="row1">
            <div className="user-name-title">
              <h1>
                {state.selectedUser
                  ? state.selectedUser._lastname +
                    ", " +
                    state.selectedUser._firstname
                  : ""}
              </h1>
            </div>
          </div>

          <hr />

          <div className="row2">
            <div className="member-usergroups">
              <div>
                <h3>UserGroups</h3>
              </div>
              {state.userGroupsForSelectedUser.length === 0 && (
                <div className="throbber">
                  <SimpleTextThrobber throbberText="Loading UserGroups" />
                </div>
              )}
              <ul className="member-usergroup-list">
                {state.userGroupsForSelectedUser.map((u) => (
                  <GroupCard
                    key={u._id}
                    group={u}
                    showActions={props.handler.config.allowManageUsers}
                    canRemoveUser={canRemoveUser}
                    onRemoveUser={removeUser}
                  />
                ))}
              </ul>
            </div>

            <div className="member-invites">
              <div>
                <h3>Invites</h3>
              </div>
              {state.loadingInvites && (
                <div className="throbber">
                  <SimpleTextThrobber throbberText="Loading User Invites" />
                </div>
              )}
              {!state.loadingInvites &&
                state.invitesForSelectedUser.length === 0 && (
                  <span className="indent-header">No pending invites</span>
                )}
              <ul>
                {state.invitesForSelectedUser.map((i) => (
                  <InviteCard
                    key={i._id}
                    invite={i}
                    isCurrentUser={i._email === props.user._email}
                    existingUser={_.find(state.users, {
                      _email: i._email,
                    })}
                    showActions={props.handler.config.allowManageInvites}
                    onCancelInvite={onCancelInvite}
                    onResendInvite={onResendInvite}
                    onAcceptInvite={onAcceptInvite}
                  />
                ))}
              </ul>
              {state.expiredInvitesForSelectedUser.length > 0 && (
                <div>
                  <span className="indent-header">Expired Invites</span>
                  <ul>
                    {state.expiredInvitesForSelectedUser.map((i) => (
                      <InviteCard
                        key={i._id}
                        invite={i}
                        isCurrentUser={i._email === props.user._email}
                        existingUser={_.find(state.users, {
                          _email: i._email,
                        })}
                        showActions={props.handler.config.allowManageInvites}
                        onCancelInvite={onCancelInvite}
                        onResendInvite={onResendInvite}
                        onAcceptInvite={onAcceptInvite}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

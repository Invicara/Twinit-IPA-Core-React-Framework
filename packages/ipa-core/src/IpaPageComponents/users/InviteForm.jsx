import React, { useState, useEffect } from "react";
import clsx from "clsx";
import _ from "lodash";
import Select from "react-select";

import { UserCard } from "./UserCard";
import SimpleTextThrobber from "../../IpaControls/SimpleTextThrobber";

import "./InviteForm.scss";
import { selectStyles } from "../../IpaControls/private/selectStyles";
import { IafUserGroup } from "@dtplatform/platform-api";

const SimpleButton = ({ children, disabled = false, onClick }) => {
  if (!disabled)
    return (
      <div className="simple-button" onClick={onClick}>
        {children}
      </div>
    );
  else return <div className="simple-button-disabled">{children}</div>;
};

export const displayOverlay = (setRenderOverlay) => {
  setRenderOverlay(true);
};

export const hideOverlay = (setShowOverlay) => {
  setShowOverlay(false);
};

export const handleEmailChange = (event, setCurrentEmail) => {
  setCurrentEmail(event.target.value.toLowerCase());
};

export const emailIsValid = (currentEmail) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(currentEmail);
};

export const keyUp = (e, addEmail) => {
  if (e.key === "Enter") addEmail();
};

export const addEmail = (
  setEmailError,
  emailIsValid,
  currentEmail,
  allEmails,
  users,
  setAllEmails,
  setCurrentEmail,
) => {
  setEmailError(null);

  if (emailIsValid(currentEmail)) {
    //check if email already in list
    let existingEmail = _.find(allEmails, { _email: currentEmail });

    //check if existing user
    let existingUser = _.find(users, { _email: currentEmail });

    if (!existingEmail) {
      //add to list
      if (existingUser) setAllEmails([existingUser, ...allEmails]);
      else setAllEmails([{ _email: currentEmail }, ...allEmails]);
    }

    setCurrentEmail("");
  } else {
    setEmailError("Invalid email address!");
  }
};

export const asUserGroupOptions = (userGroups) => {
  return userGroups.map((ug) => {
    return { label: ug._name, value: ug._id, ug: ug };
  });
};

export const resetForm = (
  setSelectedUserGroups,
  setCurrentEmail,
  setAllEmails,
  setEmailError,
  setInviteErrorMode,
) => {
  setSelectedUserGroups([]);
  setCurrentEmail("");
  setAllEmails([]);
  setEmailError(null);
  setInviteErrorMode(false);
};

export const closeOverlay = (
  e,
  inviteErrorMode,
  resetForm,
  setSelectedUserGroups,
  setCurrentEmail,
  setAllEmails,
  setEmailError,
  setInviteErrorMode,
  hideOverlay,
  setShowOverlay,
) => {
  if (e) e.preventDefault();

  if (!inviteErrorMode)
    resetForm(
      setSelectedUserGroups,
      setCurrentEmail,
      setAllEmails,
      setEmailError,
      setInviteErrorMode,
    );
  hideOverlay(setShowOverlay);
};

export const allowRemoveInvite = () => {
  return {
    allow: true,
    message: "Remove Email?",
  };
};

export const removeInviteEmail = (removeThis, allEmails, setAllEmails) => {
  let someEmails = allEmails.filter((e) => {
    return e._email !== removeThis._email;
  });
  setAllEmails(someEmails);
};

export const sendInvites = async (
  displayOverlay,
  setRenderOverlay,
  setSendingInvites,
  setInviteErrorMode,
  appUrl,
  project,
  currentUser,
  appName,
  allEmails,
  selectedUserGroups,
  setOverlayMsg,
  onInvitesSent,
) => {
  displayOverlay(setRenderOverlay);
  setSendingInvites(true);
  setInviteErrorMode(false);

  let params = {
    base_url: endPointConfig.baseRoot,
    invite_link: appUrl + (appUrl.endsWith("/") ? "" : "/"),
    type: "Project",
    name: project._name,
    inviter_name: currentUser._firstname + " " + currentUser._lastname,
    body_header: appName,
    body_content:
      currentUser._firstname +
      " " +
      currentUser._lastname +
      " has invited you to join the Project " +
      project._name +
      ".",
    subject: "Invitation to join " + appName + " Project: " + project._name,
  };

  let inviteData = allEmails.map((e) => {
    return { _email: e._email, _params: params };
  });

  let allResults = [];
  let inviteError = null;
  //have to do this syncronously as the backend throws a 500 error if we
  //multiple usergroups and multiple invites at the same time
  for (let i = 0; i < selectedUserGroups.length; i++) {
    let results = await IafUserGroup.inviteUsersToGroup(
      selectedUserGroups[i].ug,
      inviteData,
    ).catch((err) => {
      //console.error('error sending invites: ', err)
      inviteError = "Error Sending Invites";
      setInviteErrorMode(true);
    });
    allResults.push(results);
  }

  let overlayMsg;
  if (inviteError) overlayMsg = inviteError;
  else
    overlayMsg =
      "Sent " +
      selectedUserGroups.length +
      " invite" +
      (selectedUserGroups.length > 1 ? "s" : "") +
      " to " +
      inviteData.length +
      " user" +
      (inviteData.length > 1 ? "s" : "");

  setOverlayMsg(overlayMsg);
  setSendingInvites(false);
  onInvitesSent();
};

export const handleUserGroupSelection = (changes, setSelectedUserGroups) => {
  if (changes) setSelectedUserGroups(changes);
  else setSelectedUserGroups([]);
};

export const handleRenderOverlay = (renderOverlay, setShowForm) => {
  useEffect(() => {
    if (renderOverlay) setShowForm(false);
  }, [renderOverlay]);
};

export const handleShowForm = (showForm, setRenderForm, setShowOverlay) => {
  useEffect(() => {
    if (!showForm) {
      setTimeout(() => {
        setRenderForm(false);
        setShowOverlay(true);
      }, 500);
    }
  }, [showForm]);
};

export const handleRenderForm = (renderForm, setShowForm) => {
  useEffect(() => {
    if (renderForm) setShowForm(true);
  }, [renderForm]);
};

export const handleShowOverlay = (
  setRenderOverlay,
  setRenderForm,
  showOverlay,
) => {
  useEffect(() => {
    if (!showOverlay) {
      setTimeout(() => {
        setRenderOverlay(false);
        setRenderForm(true);
      }, 500);
    }
  }, [showOverlay]);
};

export const InviteForm = ({
  appName,
  appUrl,
  currentUser,
  users,
  userGroups,
  project,
  onInvitesSent,
}) => {
  const [currentEmail, setCurrentEmail] = useState(""); //current email being entered in input field
  const [allEmails, setAllEmails] = useState([]); //the list of all emails which could also be a User
  const [emailError, setEmailError] = useState(null); //a error string for a bad email address
  const [selectedUserGroups, setSelectedUserGroups] = useState([]); //the usergroups selected to send invites to
  const [sendingInvites, setSendingInvites] = useState(false); //if invites are currently being sent
  const [renderOverlay, setRenderOverlay] = useState(false); //whether to render to the form overlay
  const [showOverlay, setShowOverlay] = useState(false); //whether to show the form overlay
  const [renderForm, setRenderForm] = useState(true); //whether to render the form
  const [showForm, setShowForm] = useState(true); //whether to show the form
  const [overlayMsg, setOverlayMsg] = useState(""); //the message to display on the overlay
  const [inviteErrorMode, setInviteErrorMode] = useState(false); //if errors were encountered sending invites

  //all these useEffects are for controlling the fade in and out and rendering
  //of the form and the overlay
  handleRenderOverlay(renderOverlay, setShowForm);
  handleShowForm(showForm, setRenderForm, setShowOverlay);
  handleRenderForm(renderForm, setShowForm);
  handleShowOverlay(setRenderOverlay, setRenderForm, showOverlay);

  return (
    <div className="invite-form">
      {renderForm && (
        <div className={clsx("invite-form-content fade", showForm && "shown")}>
          <div className="invite-form-title">
            <h3>Send Invites</h3>
          </div>
          <div className="invite-groups-select">
            <div className="select-usergroups-label">Select UserGroups</div>
            <Select
              styles={{ control: selectStyles }}
              options={asUserGroupOptions(userGroups)}
              onChange={(changes) =>
                handleUserGroupSelection(changes, setSelectedUserGroups)
              }
              value={selectedUserGroups}
              isMulti={true}
              closeMenuOnSelect={false}
              isClearable={true}
              placeholder={"Select UserGroups"}
              menuPlacement="auto"
              menuPosition="fixed"
              aria-label="select-usergroups"
            />
          </div>
          <div className="email-entry">
            <label className="email-label" htmlFor="email-input">
              Email
            </label>{" "}
            {/* Proper label */}
            <input
              id="email-input"
              type="text"
              value={currentEmail}
              onChange={(event) => handleEmailChange(event, setCurrentEmail)}
              disabled={sendingInvites}
              onKeyUp={(e) => keyUp(e, addEmail)}
              size="50"
              maxLength="50"
            ></input>
            {emailError && <div className="email-error-msg">{emailError}</div>}
            <div className="align-right">
              <SimpleButton
                disabled={sendingInvites}
                onClick={() =>
                  addEmail(
                    setEmailError,
                    emailIsValid,
                    currentEmail,
                    allEmails,
                    users,
                    setAllEmails,
                    setCurrentEmail,
                  )
                }
              >
                Add Email
              </SimpleButton>
            </div>
          </div>
          <div className="invited-user-list">
            <span className="send-to-label">Send to</span>
            {allEmails.length > 0 && (
              <ul>
                {allEmails.map((e) => (
                  <UserCard
                    key={e._email}
                    user={e}
                    showActions={true}
                    canRemoveUser={allowRemoveInvite}
                    removeUserText=""
                    cancelText=""
                    onRemoveUser={(e) =>
                      removeInviteEmail(e, allEmails, setAllEmails)
                    }
                  />
                ))}
              </ul>
            )}
            {allEmails.length === 0 && (
              <div className="no-emails-msg">No emails added</div>
            )}
          </div>
          <div className="align-right">
            <SimpleButton
              disabled={
                (allEmails.length === 0 && selectedUserGroups.length === 0) ||
                sendingInvites
              }
              onClick={() =>
                resetForm(
                  setSelectedUserGroups,
                  setCurrentEmail,
                  setAllEmails,
                  setEmailError,
                  setInviteErrorMode,
                )
              }
            >
              Clear
            </SimpleButton>
            <SimpleButton
              disabled={
                allEmails.length === 0 ||
                selectedUserGroups.length === 0 ||
                sendingInvites
              }
              onClick={() =>
                sendInvites(
                  displayOverlay,
                  setRenderOverlay,
                  setSendingInvites,
                  setInviteErrorMode,
                  appUrl,
                  project,
                  currentUser,
                  appName,
                  allEmails,
                  selectedUserGroups,
                  setOverlayMsg,
                  onInvitesSent,
                )
              }
            >
              Send Invites
            </SimpleButton>
          </div>
        </div>
      )}

      {renderOverlay && (
        <div
          className={clsx("invite-form-overlay fade", showOverlay && "shown")}
        >
          <div className="overlay-content">
            {sendingInvites && (
              <SimpleTextThrobber throbberText="Sending Invites" />
            )}
            {!sendingInvites && (
              <div className="overlay-msg-content">
                <div>{overlayMsg}</div>
                <SimpleButton
                  onClick={(e) =>
                    closeOverlay(
                      e,
                      inviteErrorMode,
                      resetForm,
                      setSelectedUserGroups,
                      setCurrentEmail,
                      setAllEmails,
                      setEmailError,
                      setInviteErrorMode,
                      hideOverlay,
                      setShowOverlay,
                    )
                  }
                >
                  Close
                </SimpleButton>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

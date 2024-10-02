import React, { useState } from "react";
import clsx from "clsx";
import moment from "moment";

import "./UserGroupView.scss";

export const getFormattedDate = (ts) => {
  let expires = moment(ts);
  return expires.format("MMM D, YYYY");
};

export const confirmAction = (
  selectedAction,
  setAction,
  setActionText,
  setActionAcceptText,
  setIsDoingAction,
) => {
  setAction(selectedAction);

  if (selectedAction === "CANCEL") {
    setActionText("Confirm Invite Delete");
    setActionAcceptText(" Remove Invite");
  } else if (selectedAction === "RESEND") {
    setActionText("Confirm Resend Invite");
    setActionAcceptText(" Resend Invite");
  } else if (selectedAction === "ACCEPT") {
    setActionText("Confirm Invite Accept");
    setActionAcceptText(" Accept Invite");
  }

  setIsDoingAction(true);
};

export const cancelAction = (
  e,
  setAction,
  setActionText,
  setActionAcceptText,
  setIsDoingAction,
) => {
  if (e) e.preventDefault();

  setAction(null);
  setActionText("");
  setActionAcceptText("");
  setIsDoingAction(false);
};

export const actionConfirmed = (
  e,
  action,
  onCancelInvite,
  onResendInvite,
  onAcceptInvite,
  invite,
) => {
  if (e) e.preventDefault();

  if (action === "CANCEL") {
    if (onCancelInvite) onCancelInvite(invite);
  } else if (action === "RESEND") {
    if (onResendInvite) onResendInvite(invite);
  } else if (action === "ACCEPT") {
    if (onAcceptInvite) onAcceptInvite(invite);
  }
};

export const InviteCard = ({
  invite,
  isCurrentUser = false,
  existingUser = false,
  showActions = false,
  onCancelInvite,
  onResendInvite,
  onAcceptInvite,
}) => {
  const [isDoingAction, setIsDoingAction] = useState(false);
  const [action, setAction] = useState(null);
  const [actionText, setActionText] = useState("");
  const [actionAcceptText, setActionAcceptText] = useState("");

  let expiresDate = getFormattedDate(invite._expireTime);
  let expired = invite._status === "EXPIRED";

  return (
    <li className="user-group-list-item invite">
      <div className="card-row1">
        <div className="invite-user-info">
          {existingUser && (
            <div
              className={clsx(
                "user-full-name",
                isCurrentUser && "current-user",
              )}
            >
              {existingUser._lastname + ", " + existingUser._firstname}
            </div>
          )}
          <div className="user-email">{invite._email}</div>
        </div>
        <div className="invite-info">
          <div className={clsx("invite-expires", expired && "expired")}>
            <span className="bold">Expires:</span> {expiresDate}
          </div>
          <div className="invite-usergroup">
            <span className="bold">UserGroup:</span> {invite._usergroup._name}
          </div>
        </div>
        {showActions && !isDoingAction && (
          <div className="card-actions">
            {isCurrentUser && !expired && (
              <i
                className="fas fa-check"
                onClick={() =>
                  confirmAction(
                    "ACCEPT",
                    setAction,
                    setActionText,
                    setActionAcceptText,
                    setIsDoingAction,
                  )
                }
              ></i>
            )}
            <i
              className="fas fa-redo-alt"
              onClick={() =>
                confirmAction(
                  "RESEND",
                  setAction,
                  setActionText,
                  setActionAcceptText,
                  setIsDoingAction,
                )
              }
            ></i>
            <i
              className="fas fa-trash"
              onClick={() =>
                confirmAction(
                  "CANCEL",
                  setAction,
                  setActionText,
                  setActionAcceptText,
                  setIsDoingAction,
                )
              }
            ></i>
          </div>
        )}
      </div>
      {isDoingAction && (
        <div className="card-row2">
          <div className="confirm-text">{actionText}</div>
          <div>
            <a
              href="#"
              onClick={(e) =>
                actionConfirmed(
                  e,
                  action,
                  onCancelInvite,
                  onResendInvite,
                  onAcceptInvite,
                  invite,
                )
              }
            >
              <i className="fas fa-check"></i>
              {actionAcceptText}
            </a>
          </div>
          <div>
            <a
              href="#"
              onClick={(e) =>
                cancelAction(
                  e,
                  setAction,
                  setActionText,
                  setActionAcceptText,
                  setIsDoingAction,
                )
              }
            >
              <i className="fas fa-times"></i> Cancel
            </a>
          </div>
        </div>
      )}
    </li>
  );
};

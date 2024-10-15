import React, { useState } from "react";
import clsx from "clsx";

import SimpleTextThrobber from "../../IpaControls/SimpleTextThrobber";

import "./UserGroupView.scss";

export const cancelRemove = (e, setIsDeleting) => {
  if (e) e.preventDefault();

  setIsDeleting(false);
};

export const confirmRemove = async (
  e,
  setAllowRemove,
  setIsDeleting,
  canRemoveUser,
  group,
  setActionText,
) => {
  if (e) e.preventDefault();

  setAllowRemove(false);
  setIsDeleting(true);
  let canRemove = await canRemoveUser(null, group);
  canRemove ? setActionText(canRemove.message) : null;

  if (canRemove?.allow) {
    setAllowRemove(true);
  }
};

export const removeConfirmed = (
  e,
  setRemoving,
  setActionText,
  onRemoveUser,
  group,
) => {
  if (e) e.preventDefault();

  setRemoving(true);
  setActionText("Removing User");
  onRemoveUser(null, group);
};

export const GroupCard = ({
  group,
  disabled = false,
  selectable = false,
  isSelected = false,
  onClick,
  showActions = false,
  canRemoveUser,
  onRemoveUser,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionText, setActionText] = useState("");
  const [allowRemove, setAllowRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  if (selectable)
    return (
      <li
        onClick={onClick}
        className={clsx(
          "user-group-list-item selectable",
          isSelected && "active",
        )}
      >
        {group._name}
      </li>
    );
  else
    return (
      <li
        className={clsx(
          !disabled && "user-group-list-item",
          disabled && "disabled-group-list-item",
        )}
      >
        <div className="card-row1">
          <div>{group._name}</div>
          {showActions && (
            <div className="card-actions">
              {!isDeleting && (
                <i
                  role="button"
                  className="fas fa-trash"
                  onClick={(e) =>
                    confirmRemove(
                      e,
                      setAllowRemove,
                      setIsDeleting,
                      canRemoveUser,
                      group,
                      setActionText,
                    )
                  }
                ></i>
              )}
            </div>
          )}
        </div>
        {isDeleting && (
          <div className="card-row2">
            {!removing && <div className="confirm-text">{actionText}</div>}
            {!removing && allowRemove && (
              <div>
                <a
                  href="#"
                  onClick={(e) =>
                    removeConfirmed(
                      e,
                      setRemoving,
                      setActionText,
                      onRemoveUser,
                      group,
                    )
                  }
                >
                  <i className="fas fa-check"></i> Remove User
                </a>
              </div>
            )}
            {!removing && (
              <div>
                <a href="#" onClick={(e) => cancelRemove(e, setIsDeleting)}>
                  <i className="fas fa-times"></i> Cancel
                </a>
              </div>
            )}
            {removing && <SimpleTextThrobber throbberText={actionText} />}
          </div>
        )}
      </li>
    );
};

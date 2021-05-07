import React, { useState } from "react";
import clsx from "clsx";
import moment from 'moment'

import './UserGroupView.scss'

export const InviteCard  = ({invite, isCurrentUser=false, existingUser=false, showActions, onCancelInvite}) => {

  const [isDeleting, setIsDeleting] = useState(false)

  const getFormattedDate = (ts) => {
    let expires = moment(ts)
    return expires.format('MMM D, YYYY')
  }

  const confirmCancel = (e) => {
    e.preventDefault()

    setIsDeleting(true)
  }

  const cancelCancel = (e) => {
    if (e) e.preventDefault()

    setIsDeleting(false)
  }

  const cancelConfirmed = (e) => {
    if(e) e.preventDefault()

    onCancelInvite(invite)
  }

  let expiresDate = getFormattedDate(invite._expireTime)
  let expired = invite._status === 'EXPIRED'

  return  <li className='user-group-list-item invite'>
            <div className='invite-row1'>
              <div className='invite-user-info'>
                {existingUser && <div className={clsx('user-full-name', isCurrentUser && 'current-user')}>{existingUser._lastname + ', ' + existingUser._firstname}</div>}
                <div className='user-email'>{invite._email}</div>
              </div>
              <div className='invite-info'>
                <div className={clsx('invite-expires', expired && 'expired')}><span className='bold'>Expires:</span> {expiresDate}</div>
                <div className='invite-usergroup'><span className='bold'>UserGroup:</span> {invite._usergroup._name}</div>
              </div>
              {showActions&& <div className='invite-actions'>
                {!isDeleting && <i className='fas fa-trash' onClick={confirmCancel}></i>}
              </div>}
            </div>
            {isDeleting && <div className='invite-delete-confirm'>
              <div className='confirm-invite-delete-text'>Confirm Invite Delete</div>
              <div><a href='#' onClick={cancelConfirmed}><i className='fas fa-check'></i> Remove Invite</a></div>
              <div><a href='#' onClick={cancelCancel}><i className='fas fa-times'></i> Cancel</a></div>
            </div>}
          </li>
}
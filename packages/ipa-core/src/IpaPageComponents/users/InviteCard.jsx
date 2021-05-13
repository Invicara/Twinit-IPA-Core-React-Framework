import React, { useState } from "react";
import clsx from "clsx";
import moment from 'moment'

import './UserGroupView.scss'

export const InviteCard  = ({invite, isCurrentUser=false, existingUser=false, showActions=false, onCancelInvite, onResendInvite}) => {

  const [isDoingAction, setIsDoingAction] = useState(false)
  const [action, setAction] = useState(null)
  const [actionText, setActionText] = useState('')
  const [actionAcceptText, setActionAcceptText] = useState('')

  const getFormattedDate = (ts) => {
    let expires = moment(ts)
    return expires.format('MMM D, YYYY')
  }

  const confirmAction = (selectedAction) => {

    setAction(selectedAction)

    if (selectedAction === 'CANCEL') {
      setActionText('Confirm Invite Delete')
      setActionAcceptText(' Remove Invite')
    } else if (selectedAction === 'RESEND') {
      setActionText('Confirm Resend Invite')
      setActionAcceptText(' Resend Invite')
    }
    
    setIsDoingAction(true)
  }

  const cancelAction = (e) => {
    if (e) e.preventDefault()

    setAction(null)
    setActionText('')
    setActionAcceptText('')
    setIsDoingAction(false)
  }

  const actionConfirmed = (e) => {
    if(e) e.preventDefault()

    if (action === 'CANCEL')
      onCancelInvite(invite)
    else if (action === 'RESEND')
      onResendInvite(invite)
  }

  let expiresDate = getFormattedDate(invite._expireTime)
  let expired = invite._status === 'EXPIRED'

  return  <li className='user-group-list-item invite'>
            <div className='card-row1'>
              <div className='invite-user-info'>
                {existingUser && <div className={clsx('user-full-name', isCurrentUser && 'current-user')}>{existingUser._lastname + ', ' + existingUser._firstname}</div>}
                <div className='user-email'>{invite._email}</div>
              </div>
              <div className='invite-info'>
                <div className={clsx('invite-expires', expired && 'expired')}><span className='bold'>Expires:</span> {expiresDate}</div>
                <div className='invite-usergroup'><span className='bold'>UserGroup:</span> {invite._usergroup._name}</div>
              </div>
              {showActions && !isDoingAction && <div className='card-actions'>
                <i className='fas fa-redo-alt' onClick={() => confirmAction('RESEND')}></i>
                <i className='fas fa-trash' onClick={() => confirmAction('CANCEL')}></i>
              </div>}
            </div>
            {isDoingAction && <div className='card-row2'>
              <div className='confirm-text'>{actionText}</div>
              <div><a href='#' onClick={actionConfirmed}><i className='fas fa-check'></i>{actionAcceptText}</a></div>
              <div><a href='#' onClick={cancelAction}><i className='fas fa-times'></i> Cancel</a></div>
            </div>}
          </li>
}
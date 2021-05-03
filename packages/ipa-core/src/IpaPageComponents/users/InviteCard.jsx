import React from "react";
import clsx from "clsx";
import moment from 'moment'

import './UserGroupView.scss'

export const InviteCard  = ({invite, isCurrentUser=false, existingUser=false}) => {

  function getFormattedDate(ts) {
    let expires = moment(ts)
    return expires.format('MMM D, YYYY')
  }

  let expiresDate = getFormattedDate(invite._expireTime)
  let expired = invite._status === 'EXPIRED'

  return  <li className='user-group-list-item invite'>
            <div className='invite-user-info'>
              {existingUser && <div className={clsx('user-full-name', isCurrentUser && 'current-user')}>{existingUser._lastname + ', ' + existingUser._firstname}</div>}
              <div className='user-email'>{invite._email}</div>
            </div>
            <div className='invite-info'>
              <div className={clsx('invite-expires', expired && 'expired')}><span className='bold'>Expires:</span> {expiresDate}</div>
              <div className='invite-usergroup'><span className='bold'>UserGroup:</span> {invite._usergroup._name}</div>
            </div>
          </li>
}
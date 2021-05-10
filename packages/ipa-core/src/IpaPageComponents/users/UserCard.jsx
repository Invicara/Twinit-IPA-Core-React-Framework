import React, { useState } from "react";
import clsx from "clsx";

import './UserGroupView.scss'

export const UserCard  = ({user, isCurrentUser=false, selectable=false, isSelected=false, showActions=false, onClick, canRemoveUser, onRemoveUser}) => {

  const [isDeleting, setIsDeleting] = useState(false)
  const [actionText, setActionText] = useState('')
  const [allowRemove, setAllowRemove] = useState(false)

  const confirmRemove = async (e) => {
    if (e) e.preventDefault()

    setAllowRemove(false)
    setIsDeleting(true)
    let canRemove = await canRemoveUser(user)

    if (!canRemove.allow) {
      setActionText(canRemove.message)
    } else {
      setActionText('Confirm Remove User')
      setAllowRemove(true)
    }
  }

  const cancelRemove = (e) => {
    if (e) e.preventDefault()
    setIsDeleting(false)
  }

  const removeConfirmed = (e) => {
    if (e) e.preventDefault()

    onRemoveUser(user)
  }

  if (selectable)
      return <li onClick={onClick} className={clsx('user-group-list-item selectable', isSelected && 'active')}>
        {user._lastname && <div className={clsx('user-full-name', isCurrentUser && 'current-user')}>{user._lastname + ", " + user._firstname}</div>}
        <div className='user-email'>{user._email}</div>
      </li>
  else return <li className='user-group-list-item'>
      <div className='card-row1'>
        <div>
          {user._lastname && <div className={clsx('user-full-name', isCurrentUser && 'current-user')}>{user._lastname + ", " + user._firstname}</div>}
          <div className='user-email'>{user._email}</div>
        </div>
        {showActions&& <div className='card-actions'>
          {!isDeleting && <i className='fas fa-trash' onClick={confirmRemove}></i>}
        </div>}
      </div>
      {isDeleting && <div className='card-row2'>
        <div className='confirm-text'>{actionText}</div>
        {allowRemove && <div><a href='#' onClick={removeConfirmed}><i className='fas fa-check'></i> Remove User</a></div>}
        <div><a href='#' onClick={cancelRemove}><i className='fas fa-times'></i> Cancel</a></div>
      </div>}
    </li>
}
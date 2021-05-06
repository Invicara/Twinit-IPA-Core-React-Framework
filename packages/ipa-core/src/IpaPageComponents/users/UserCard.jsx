import React from "react";
import clsx from "clsx";

import './UserGroupView.scss'

export const UserCard  = ({user, isCurrentUser=false, selectable=false, isSelected=false, onClick}) => {

    if (selectable)
        return <li onClick={onClick} className={clsx('user-group-list-item selectable', isSelected && 'active')}>
          {user._lastname && <div className={clsx('user-full-name', isCurrentUser && 'current-user')}>{user._lastname + ", " + user._firstname}</div>}
          <div className='user-email'>{user._email}</div>
        </li>
    else return <li className='user-group-list-item'>
        {user._lastname && <div className={clsx('user-full-name', isCurrentUser && 'current-user')}>{user._lastname + ", " + user._firstname}</div>}
        <div className='user-email'>{user._email}</div>
      </li>
}
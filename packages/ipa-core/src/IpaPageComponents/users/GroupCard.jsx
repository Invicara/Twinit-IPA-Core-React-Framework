import React from "react";
import clsx from "clsx";

import './UserGroupView.scss'

export const GroupCard  = ({group, disabled=false, selectable=false, isSelected=false, onClick}) => {

    if (selectable)
        return <li onClick={onClick} className={clsx('user-group-list-item selectable', isSelected && 'active')}>
            {group._name}
        </li>
    else
        return <li className={clsx(!disabled && 'user-group-list-item', disabled && 'disabled-group-list-item')}>
            {group._name}
        </li>
}


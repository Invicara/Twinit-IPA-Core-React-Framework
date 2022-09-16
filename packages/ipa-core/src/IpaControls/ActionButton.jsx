
import React from 'react';
import './ActionButton.scss';
import { Tooltip } from "@material-ui/core";


export default function ActionButton(props) {
    return <span className={`action-button`}>
        <Tooltip title={props.title}>
            <i className={props.icon} onClick={props.onClick}/>
        </Tooltip>
    </span>
}

import React from 'react';
import './ActionButton.scss';
import { Tooltip } from "@mui/material";


export default function ActionButton(props) {
    const { disabled, onClick } = props;
    
    const handleClick = (e) => {
        if (disabled) return;
        onClick?.(e);
    };

    return <span className={`action-button${disabled ? ' action-button--disabled' : ''}`}>
        <Tooltip title={props.title}>
            <i className={props.icon} onClick={handleClick}/>
        </Tooltip>
    </span>
}
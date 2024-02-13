import React from 'react';
import { Tooltip } from "@mui/material";
import './AlertIndicator.scss';

const AlertIndicator = ({className, descriptions}) => {

    return <Tooltip
        title={<div>{descriptions.map(a => (
            <p>{a}</p>
        ))}</div>}
    >
        <i className={`alert-indicator ${className || ""} fa fa-exclamation-triangle`}/>
    </Tooltip> 
}

export default AlertIndicator
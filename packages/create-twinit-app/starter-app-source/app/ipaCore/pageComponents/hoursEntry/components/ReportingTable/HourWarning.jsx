import React from 'react'

import { Tooltip } from "@material-ui/core";

const HourWarning = ({message}) => {

   return <Tooltip
        title={<div>{message}</div>}
    >
        <i className="fas fa-exclamation-triangle"></i>
    </Tooltip>

}

export default HourWarning
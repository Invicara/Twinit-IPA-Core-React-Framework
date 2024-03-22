import React from 'react';
import './GenericMatButton.scss'
import {Typography} from "@material-ui/core";

const GenericMatText = ({variant = "button", display = "block", fontSize = "normal", children, ...rest}) => {
    return <Typography {...rest} variant={variant} display={display} sx={{fontSize: fontSize}} gutterBottom>
        {children}
    </Typography>
}

export default GenericMatText;
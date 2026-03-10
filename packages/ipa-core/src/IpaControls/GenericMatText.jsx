import React from 'react';
import './GenericMatButton.scss'
import {Typography} from "@mui/material";

const GenericMatText = ({variant = "button", display = "block", fontSize = "normal", children, ...rest}) => {
    return <Typography {...rest} variant={variant} display={display} sx={{fontSize: fontSize}} gutterBottom>
        {children}
    </Typography>
}

export default GenericMatText;
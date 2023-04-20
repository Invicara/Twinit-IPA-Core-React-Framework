/**
 * ****************************************************************************
 *
 * INVICARA INC CONFIDENTIAL __________________
 *
 * Copyright (C) [2012] - [2018] INVICARA INC, INVICARA Pte Ltd, INVICARA INDIA
 * PVT LTD All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains the property of
 * Invicara Inc and its suppliers, if any. The intellectual and technical
 * concepts contained herein are proprietary to Invicara Inc and its suppliers
 * and may be covered by U.S. and Foreign Patents, patents in process, and are
 * protected by trade secret or copyright law. Dissemination of this information
 * or reproduction of this material is strictly forbidden unless prior written
 * permission is obtained from Invicara Inc.
 */

import React from 'react';
import './GenericMatButton.scss'
import {Typography} from "@material-ui/core";

const GenericMatText = ({variant = "button", display = "block", fontSize = "normal", children, ...rest}) => {
    return <Typography {...rest} variant={variant} display={display} sx={{fontSize: fontSize}} gutterBottom>
        {children}
    </Typography>
}

export default GenericMatText;
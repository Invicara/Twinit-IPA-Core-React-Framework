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

import React from "react";
import Button from "@mui/material/Button";

import "./GenericMatButton.scss";

export default class GenericMatButton extends React.Component {
  render() {
    return (
      <div className={`GenericMatButton ${this.props.className}`}>
        <Button
          variant="contained"
          size={this.props.size}
          style={{ ...this.props.styles }}
          onClick={this.props.onClick}
          disabled={this.props.disabled}
          className={this.props.customClasses}
          sx={{
            "padding" : "6px 16px !important",
            ...(!this.props.disabled && {
              '&.MuiButton-contained': {
                color: 'rgba(0, 0, 0, 0.87)',
                boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
                backgroundColor: '#e0e0e0',
              },
            }),
          }}
        >
          {this.props.children}
        </Button>
      </div>
    );
  }
}

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
import Button from '@material-ui/core/Button';

import './GenericMatButton.scss'

export default class GenericMatButton extends React.Component {
  render() {
    
    
    return (
        <div className="GenericMatButton">    
          <Button variant="contained" style={{...this.props.styles}} onClick={this.props.onClick} disabled={this.props.disabled} className={this.props.customClasses}>
              {this.props.children}
          </Button>
        </div>
    )
  }
}
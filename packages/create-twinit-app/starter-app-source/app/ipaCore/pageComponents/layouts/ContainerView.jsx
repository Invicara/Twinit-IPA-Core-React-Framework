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

import React from "react"

export default class ContainerView extends React.Component {
  render() {
    const {toggle3DModelPopUp, showModelAction} = this.props;

    return (
      <div >

          {this.props.children}
          {/*showModelAction && <div className={'button-3d-view'} onClick={toggle3DModelPopUp} ><span className={'button-3d-view-text'}>3D</span></div>*/}
      </div>
    )
  }
}

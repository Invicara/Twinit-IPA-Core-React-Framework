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
import {IfefModal} from '@invicara/react-ifef';
import './GenericModal.scss'

class GenericModal extends React.Component {
  render() {
    const {title, modalBody, modalType, placeHolder, closeButtonHandler, width, height, noPadding, noBackground} = this.props;
    return (
      <IfefModal customTemplate={this.props.customTemplate ? this.props.customTemplate : false}
                 title={title}
                 barClasses={this.props.barClasses ? this.props.barClasses : "bar-dark"}
                 closeButtonHandler={closeButtonHandler}
                 modalType={modalType}
                 placeHolder={placeHolder}
                 width={width}
                 height={height}
                 customClasses={this.props.customClasses ? this.props.customClasses : "ipa-modal"}>
        <div style={{padding: noPadding? '0':'3% 10%', fontSize: '16px', background: noBackground? 'transparent' : 'white'}}>

            {modalBody}

        </div>
      </IfefModal>
    );
  }
}

export default GenericModal;
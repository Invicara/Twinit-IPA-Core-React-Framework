import React from 'react'

import { Tooltip } from "@material-ui/core";
import classNames from 'classnames'

import './ApprovalButton.scss'

const ApprovalButton = ({btnText, message, onClick}) => {

   return <Tooltip
        title={<div>{message}</div>}
      >
        <div className={classNames({'approve-btn': true, 'approve-btn-long': !!btnText})} onClick={onClick}>
            <i className='fas fa-chevron-circle-right'></i>{btnText ? btnText : ''}
         </div>
      </Tooltip>

}

export default ApprovalButton
import React, { useState } from "react";
import clsx from "clsx";
import moment from 'moment'

import './DatasourceCard.scss'

export const DatasourceCard  = ({orchestrator, showActions=false}) => {

  const [isDoingAction, setIsDoingAction] = useState(false)
  const [action, setAction] = useState(null)
  const [actionText, setActionText] = useState('')
  const [actionAcceptText, setActionAcceptText] = useState('')

  return  <li className='datasource-list-item'>
            <div className='card-row1'>
              <div className='datasource-info'>
                <div className='datasource-name'>{orchestrator._name}</div>
                <div className='datasource-desc'>{orchestrator._description}</div>
              </div>
              <div className='datasource-info'>
                <div><span style={{fontWeight: 'bold'}}>Type: </span>{orchestrator._class}</div>
                <div><span style={{fontWeight: 'bold'}}>User Type: </span>{orchestrator._userType}</div>
              </div>
              {showActions && !isDoingAction && <div className='datasource-card-actions'></div>}
            </div>
            {isDoingAction && <div className='card-row2'>
              <div className='confirm-text'>{actionText}</div>
              <div><a href='#' onClick={actionConfirmed}><i className='fas fa-check'></i>{actionAcceptText}</a></div>
              <div><a href='#' onClick={cancelAction}><i className='fas fa-times'></i> Cancel</a></div>
            </div>}
          </li>
}
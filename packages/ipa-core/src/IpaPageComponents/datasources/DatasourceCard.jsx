import React, { useState } from "react";
import clsx from "clsx";
import moment from 'moment'

import SimpleTextThrobber from '../../IpaControls/SimpleTextThrobber'

import './DatasourceCard.scss'

export const DatasourceCard  = ({orchestrator, showActions=false, runs}) => {

  const [isDoingAction, setIsDoingAction] = useState(false)
  // const [action, setAction] = useState(null)
  // const [actionText, setActionText] = useState('')
  // const [actionAcceptText, setActionAcceptText] = useState('')
  const [showRowTwo, setShowRowTwo] = useState(false)
  const [showHistory, setShowHistory] = useState(false)


  const toggleHistory = () => {
    if (showHistory) setShowRowTwo(false)
    else setShowRowTwo(true)
    setShowHistory(!showHistory)
  }

  const getFormattedDate = (stamp) => {
    let rundate = moment(parseInt(stamp))
    return rundate.format('MMM D YYYY kk:mm:ss')
  }

  const sortRuns = () => {
    if (runs) return [...runs].sort((a,b) => parseInt(b._createdat) - parseInt(a._createdat))
    else return null
  }

  const getLatestRun = () => {
    if (runs) {
      let sortedRuns = sortRuns()
      return sortedRuns.shift()
    } else return null
  }

  const getLatestRunStatus = () => {
    if (runs) {
      let last = getLatestRun()
      if (last._status === 'RUNNING' || last._status === 'QUEUED')
        return <SimpleTextThrobber throbberText={last._status}/>
      else 
        return last._status
    } else return 'NOT RUN'
  }

  // <div className='confirm-text'>{actionText}</div>
  //             <div><a href='#' onClick={actionConfirmed}><i className='fas fa-check'></i>{actionAcceptText}</a></div>
  //             <div><a href='#' onClick={cancelAction}><i className='fas fa-times'></i> Cancel</a></div>


  return  <li className='datasource-list-item'>
            <div className='card-row1'>
              <div className='datasource-info'>
                <div className='datasource-name'>{orchestrator._name}</div>
                <div className='datasource-desc'>{orchestrator._description}</div>
              </div>
              <div className='datasource-info'>
                <div className='info-point'>
                  <span style={{fontWeight: 'bold'}}>Type: </span>
                  <span className='info-value'>{orchestrator._class}</span>
                </div>
                <div className='info-point'>
                  <span style={{fontWeight: 'bold'}}>User Type: </span>
                  <span className='info-value'>{orchestrator._userType}</span>
                </div>
                <div className='info-point'>
                  <span style={{fontWeight: 'bold'}}>Last Status: </span>
                  <span className={clsx('info-value', getLatestRunStatus() === 'ERROR' && 'error')}>{getLatestRunStatus()}</span>
                </div>
              </div>
              <div className='datasource-card-options'>
                {runs && <i className='fas fa-history' onClick={toggleHistory}></i>}
              </div>
            </div>
            {showRowTwo && <div className='card-row2'>
              {showHistory && <table className='datasource-history-table'>
                <thead>
                  <tr>
                    <th>Run at</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortRuns().map((run) => {
                    return <tr key={run.id} className={clsx(run._status === "ERROR" && 'error')}>
                      <td className='stamp'>{getFormattedDate(run._createdat)}</td>
                      <td className='status'>{run._status}</td>
                    </tr>}
                  )}
                </tbody>
              </table>}
            </div>}
          </li>
}
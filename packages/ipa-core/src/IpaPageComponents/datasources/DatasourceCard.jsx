import React, { useState } from "react";
import clsx from "clsx";
import moment from 'moment'

import SimpleTextThrobber from '../../IpaControls/SimpleTextThrobber'
import { DatasourceHistoryTable } from './DatasourceHistoryTable'
import { DatasourceScheduleTable } from './DatasourceScheduleTable'


import './DatasourceCard.scss'
import { IafDataSource } from "@invicara/platform-api";

export const DatasourceCard  = ({orchestrator, readonly=true, runs, onDidUpdate}) => {

  const [isDoingAction, setIsDoingAction] = useState(false)
  const [showRowTwo, setShowRowTwo] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)

  const getFormattedDate = (stamp) => {
    let rundate = moment(parseInt(stamp))
    return rundate.format('MMM D YYYY kk:mm:ss')
  }

  const toggleHistory = () => {
    if(showSchedule) setShowSchedule(false)
    if (showHistory) setShowRowTwo(false)
    else setShowRowTwo(true)
    setShowHistory(!showHistory)
  }

  const toggleSchedule = () => {
    if(showHistory) setShowHistory(false)
    if (showSchedule) setShowRowTwo(false)
    else setShowRowTwo(true)
    setShowSchedule(!showSchedule)
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

  const updateSchedule = (orchestrator, newInterval) => {
    return new Promise((resolve, reject) => {
      setIsDoingAction(true)
      IafDataSource.updateOrchestratorSchedule(orchestrator._orchschedule._id, {runinterval: newInterval}).then((res) => {
        onDidUpdate()
        resolve(res)
      }).catch((err) => {
        console.error(err)
      }).finally(() => {
        setIsDoingAction(false)
      })

    })
  }


  return  <li className='datasource-list-item'>
            <div className='card-row1'>
              <div className='datasource-name'>
                <div className='datasource-name'>{orchestrator._name}</div>
                <div className='datasource-desc'>{orchestrator._description}</div>
              </div>
              <div className='datasource-info'>
                <div className='info-point'>
                  <span style={{fontWeight: 'bold'}}>Type: </span>
                  <span className='info-value'>{orchestrator._class}</span>
                </div>
                {orchestrator._class === "SCHEDULED" && <div className='info-point'>
                  <span style={{fontWeight: 'bold'}}>Next Run: </span>
                  <span className='info-value'>{getFormattedDate(orchestrator._orchschedule.next_scheduled_time)}</span>
                </div>}
                <div className='info-point'>
                  <span style={{fontWeight: 'bold'}}>User Type: </span>
                  <span className='info-value'>{orchestrator._userType}</span>
                </div>
                <div className='info-point'>
                  <span style={{fontWeight: 'bold'}}>Last Status: </span>
                  <span className={clsx('info-value', getLatestRunStatus() === 'ERROR' && 'error')}>{getLatestRunStatus()}</span>
                </div>
              </div>
              {!isDoingAction && <div className='datasource-card-options'>
                {runs && <i className='fas fa-history' onClick={toggleHistory}></i>}
                {orchestrator._class === "SCHEDULED" && <i className='far fa-calendar-alt' onClick={toggleSchedule}></i>}
              </div>}
            </div>
            {showRowTwo && <div className='card-row2'>
              {showHistory && <DatasourceHistoryTable runs={runs} />}
              {showSchedule && <DatasourceScheduleTable orchestrator={orchestrator} readonly={readonly} updateOrchestratorSchedule={updateSchedule}/>}
            </div>}
          </li>
}
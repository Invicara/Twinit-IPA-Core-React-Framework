import React, { useState, useEffect } from "react";

import SimpleTextThrobber from '../../IpaControls/SimpleTextThrobber'

import './DatasourceScheduleTable.scss'

export const DatasourceScheduleTable  = ({orchestrator, readonly=true, updateOrchestratorSchedule}) => {

  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [editing, setEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setScheduleFromOrchestrator()
  }, [])

  const setScheduleFromOrchestrator = () => {
    let splitInt = orchestrator._orchschedule.runinterval.split(' ')

    for (let i = 0; i < splitInt.length; i++) {
      if (splitInt[i] === '*') splitInt[i] = 0
    }

    setHours(parseInt(splitInt[0]))
    setMinutes(parseInt(splitInt[1]))
    setSeconds(parseInt(splitInt[2]))
  }

  const editSchedule = (e) => {
    if (e) e.preventDefault()
    if (!readonly) setEditing(true)
  }

  const cancelEditSchedule = (e) => {
    if (e) e.preventDefault()
    setEditing(false)
    setScheduleFromOrchestrator()
  }

  const getInput = (value, updateValue) => {
    return <input className='datasource-schedule-input' type='number' disabled={isSaving} value={value} onChange={(e) => updateValue(e.target.value)}/>
  }

  const onSave = (e) => {
    if (e) e.preventDefault()

    setIsSaving(true)
    setEditing(false)
    let newIntervalString = (hours === 0 ? "*" : hours) + " " + (minutes === 0 ? "*" : minutes) + " " + (seconds === 0 ? "*" : seconds)

    updateOrchestratorSchedule(orchestrator, newIntervalString).then(() => {
      setIsSaving(false)
    })

  }
  

  return  <table className='datasource-schedule-table'>
    <thead>
      <tr className='first-row'>
        <th colSpan='3'>Run Every:</th>
        <th></th>
      </tr>
      <tr>
        <th>Hours</th>
        <th>Minutes</th>
        <th>Seconds</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          {!editing && <span>{hours}</span>}
          {editing && getInput(hours, setHours)}
        </td>
        <td>
          {!editing && <span>{minutes}</span>}
          {editing && getInput(minutes, setMinutes)}
        </td>
        <td>
          {!editing && <span>{seconds}</span>}
          {editing && getInput(seconds, setSeconds)}
        </td>
        <td className='buttons'>
          {!editing && !readonly && !isSaving && <a href="#" onClick={editSchedule}>edit</a>}
          {editing && <a href="#" onClick={cancelEditSchedule}>cancel</a>}
          {editing && <a href="#" onClick={onSave}>save</a>}
          {isSaving && <SimpleTextThrobber throbberText='Saving schedule' />}
        </td>
      </tr>
    </tbody>
  </table>
}
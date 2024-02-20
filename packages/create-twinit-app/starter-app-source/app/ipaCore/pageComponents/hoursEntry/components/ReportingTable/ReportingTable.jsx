import React, { useEffect, useState } from 'react'

import WaitingDots from '../../../../components/WaitingDots'
import classNames from 'classnames'

import ProjectSelect from '../ProjectSelect'
import ReportingTableRow from './ReportingTableRow'
import HourWarning from './HourWarning'
import { ToastContainer, useToast, SuccessToast, ErrorToast, WarningToast } from "@invicara/ipa-core/modules/IpaControls"

import './ReportingTable.scss'
import twinitUtils from '../../../utils/twinitUtils.mjs'

const warningMessage = `You have entered more than 7 hours for this day.
This is not an error but just a notice to get your attention.
Chances are you worked more than 8 hours during this day.
If you see these alerts frequently please discuss your workload with your manager.`

const monthNames = [
   'January', 'February', 'March', 'April', 'May', 'June', 'July',
   'August', 'September', 'October', 'November', 'December'
]

const dayNames = [
   'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

const ReportingTable = ({month, week, existingHoursForWeek, unsavedChanges, onChange, onSave, isSaving}) => {

   const [ monthName, setMonthName ] = useState()
   const [ days, setDays ] = useState([])
   const [ dayWarnings, setDayWarnings ] = useState([])

   const [ rows, setRows ] = useState([])

   const [ toasts, addToast ] = useToast()

   useEffect(() => {

      setMonthName(monthNames[month.split('-')[1]-1])
     
   }, [month])

   useEffect(() => {

      let weekDays = []

      for (let i = week.start; i <= week.end; i++) {

         weekDays.push({
            month,
            week,
            date: i,
            dateObj: new Date(month.split('-')[0], month.split('-')[1]-1, i)
         })

      }

      setDays(weekDays)


   }, [week])

   useEffect(() => {
      if (existingHoursForWeek) {
         setRows(existingHoursForWeek)
      }
   }, [existingHoursForWeek])

   useEffect(() => {
      checkDayHours()
   }, [rows])

   const handleProjectSelect = async (project) => {

      let projectItem
      try {
         projectItem = await twinitUtils.getProjectsByName([project])
      } catch(err) {
         console.error(err)
         addToast({toast: <ErrorToast message='An error was encountered while fetching the selected project. Please contact an Administrator.' />, delay: 7000})
         return
      }

      let updatedRows = [...rows]
      updatedRows.push({
         project,
         projectItem: {_list: projectItem},
         days: structuredClone(days),
         approved: false
      })
      setRows(updatedRows)
      console.log(updatedRows)
   }

   const checkDayHours = () => {

      let dayHours = []

      if (rows.length) {

         for ( let i = 0; i < rows[0].days.length; i++ ) {
            let billable = rows[0].days[i].hours ? parseFloat(rows[0].days[i].hours) : 0
            let nonbillable = rows[0].days[i].nonHours ? parseFloat(rows[0].days[i].nonHours) : 0
            dayHours.push(billable+nonbillable)
         }

         if (rows.length > 1) {

            for ( let i = 1; i < rows.length; i++ ) {
              
               rows[i].days.forEach((d, i) => {

                  if (d.hours) {
                     dayHours[i] += parseFloat(d.hours)
                  }

                  if (d.nonHours) {
                     dayHours[i] += parseFloat(d.nonHours)
                  }

               })

            }

         }
      }

      let calcDayWarning = []
      dayHours.forEach(dh => {
         if (dh > 7) {
            calcDayWarning.push(true)
         } else {
            calcDayWarning.push(false)
         }
      })

      setDayWarnings(calcDayWarning)

   }

   const onRemoveRow = (row) => {

      if (row._id) {
         console.error('Cannot remove a row already saved!')
         return
      }

      let updatedRows = structuredClone(rows)
      let removeRowIndex = updatedRows.findIndex(ur => ur.project === row.project)
      updatedRows.splice(removeRowIndex, 1)

      setRows(updatedRows)

   }

   const handleRowChange = (row, day, rowUpdates) => {

      let updatedRows = structuredClone(rows)

      if (day) {
         if (day.hours == '')
         day.hours = 0

         let updatedRow = updatedRows.find((r) => r.project === row.project)
         let rowDayIndex = updatedRow.days.findIndex(d => d.date === day.date)
         updatedRow.days.splice(rowDayIndex, 1, day)
      } else {
         let rowToUpdate = updatedRows.find(r => r.project === row.project)

         Object.keys(rowUpdates).forEach((k) => {
            rowToUpdate[k] = rowUpdates[k]
         })

      }
      
      setRows(updatedRows)
      if (onChange) onChange(updatedRows)

   }

   const onSubmitSave = (rows) => {
      
      if (onSave) {
         onSave(rows)
      }
   
   }

   return <div className='reporting-table-wrapper'>
      <ToastContainer toasts={toasts} />
      {(!existingHoursForWeek || isSaving) && <WaitingDots message={isSaving ? 'Saving Your Changes...' : 'Loading Previously Submitted Hours...'} />}
      <table className='reporting-table' style={{display: (!existingHoursForWeek || isSaving) ? 'none' : ''}}>
         <colgroup>
            <col />
            {days.map((d, i) => <col key={d.date} className={classNames({'table-full-day-warning': dayWarnings[i]})}/>)}
            <col/>
         </colgroup>
         <thead>
            <tr>
               <th></th>
               <th colSpan={days.length}><h2>{monthName}</h2></th>
               <th></th>
            </tr>
            <tr>
               <th></th>
               {days.map((d,i) => <th key={d.date}>
                  <div>{dayNames[d.dateObj.getDay()]} - {d.date}</div>
                  {dayWarnings[i] && <HourWarning message={warningMessage} />}
               </th>)}
               <th>Week Total</th>
            </tr>
         </thead>
         <tbody>
            {rows.map(r => <ReportingTableRow key={r.project} row={r} onChange={handleRowChange} onRemove={onRemoveRow} exclude={rows.map(r => r.project)}/>)}
            <tr className='project-select-row'>
               <td>
                  <ProjectSelect onChange={handleProjectSelect} exclude={rows.map(r => r.project)}/>
               </td>
               <td colSpan={days.length-1}></td>
               <td className="reporting-table-week-total-label">Total:</td>
               <td className="reporting-table-week-total">
                  {rows.reduce((acc, curr) => acc + curr.days.reduce((dacc, dcurr) => dacc + (dcurr.hours ? parseFloat(dcurr.hours) : 0) + (dcurr.nonHours ? parseFloat(dcurr.nonHours) : 0), 0), 0)}
               </td>
            </tr>
         </tbody>
      </table>
      {(unsavedChanges && month && days && rows) && <div className="table-controls">
         {!isSaving && <div className='table-save-btn' onClick={() => onSubmitSave(rows)}>Save</div>}
      </div>}

   </div>
}

export default ReportingTable
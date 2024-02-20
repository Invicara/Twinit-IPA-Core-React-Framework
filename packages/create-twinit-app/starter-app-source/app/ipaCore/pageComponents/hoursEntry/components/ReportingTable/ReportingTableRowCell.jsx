import React, { useEffect, useState, useContext } from 'react'

import classNames from 'classnames'

import WaitingDots from '../../../../components/WaitingDots'
import HourWarning from './HourWarning'

import { AdminContext } from '../../HoursEntryView'

import './ReportingTableRowCell.scss'

const warningMessage = `You have entered more than 7 hours for this project for this day.
This is not an error but just a notice to get your attention.
Chances are you worked more than 8 hours during this day.
If you see these alerts frequently please discuss your workload with your manager.`

const ReportingTableRowCell = ({day, onChange, approved, regions}) => {

   const adminMode = useContext(AdminContext)

   const [ nonBillable, showNonBillable ] = useState(false)

   useEffect(() => {

      if (day.nonHours && day.nonHours > 0) 
         showNonBillable(true)

   }, [])

   const showWarning = () => {

      let billable = day.hours && day.hours > 0 ? parseFloat(day.hours) : 0
      let nonbillable = day.nonHours && day.nonHours > 0 ? parseFloat(day.nonHours) : 0

      return billable + nonbillable > 7

   }

   const handleChange = (type, value) => {

      if (type === 'hours' || type === 'nonHours') {
         if (value < 0 || value > 12)
            return
      }

      let tempDay = structuredClone(day)
      tempDay[type] = value

      if (onChange) onChange(tempDay)

   }

   const hoursNotEntered = () => {

       let noBillable = !day.hours || day.hours == 0 || day.hours === ''
       let noNonBillable = !day.nonHours || day.nonHours == 0 || day.nonHours === ''

      return noBillable && noNonBillable

   }

   return <td className='reporting-table-row-cell'>
       {!day && <WaitingDots message="Loading Data..." />}
      {day && <div className='reporting-table-row-cell-controls'>
         {approved && <div className='approved-notice'>
            <span><i className="fas fa-lock"></i> APPROVED</span>
         </div>}
         <div className="hours-ctrl">
            <label>Billable Hours {showWarning() && <HourWarning message={warningMessage} />}</label>
            <hr/>
            <div>
               <input
                  className={classNames({"hours-input-field": true, "hours-warning": day.hours > 7})}
                  type="number"
                  step="0.01"
                  name="hours-input"
                  value={day.hours ? day.hours : 0}
                  onChange={(e) => handleChange('hours', e.target.value)}
                  disabled={!adminMode && approved}
               ></input>
            </div>
            {!nonBillable && !approved && <div className='add-non-bill-btn' onClick={() => showNonBillable(true)}><i className="fas fa-plus"></i>non-billable</div>}
            {nonBillable && <div>
               <label htmlFor="hours-input" className="hours-label-sub">Non-Billable</label>
               <input
                  className={classNames({"hours-input-field": true, "hours-warning": day.hours > 7})}
                  type="number"
                  step="0.01"
                  name="hours-input"
                  value={day.nonHours ? day.nonHours : 0}
                  onChange={(e) => handleChange('nonHours', e.target.value)}
                  disabled={!adminMode && approved}
               ></input>
            </div>}
         </div>
         <div>
            <label htmlFor="task-input">Task Desc</label>
            <textarea
               rows="5"
               name="task-input"
               value={day.task ? day.task : ''}
               onChange={(e) => handleChange('task', e.target.value)}
               disabled={!adminMode && (approved || hoursNotEntered())}
            ></textarea>
         </div>
         <div>
            <label htmlFor="memo-input">Memo</label>
            <textarea
               rows="5"
               name="memo-input"
               value={day.memo ? day.memo : ''}
               onChange={(e) => handleChange('memo', e.target.value)}
               disabled={!adminMode && (approved || hoursNotEntered())}
            ></textarea>
         </div>
         {regions && <div className='region-select'>
            <label className='region-select-label'>Region <span className="required">*</span>
               <select value={day.region || ''} defaultValue={day.region || ''} onChange={(e) => handleChange('region', e.target.value)} 
                  disabled={!adminMode && (approved || hoursNotEntered())} >
                     <option value={''} disabled>No region</option>
                     {regions.map(r => <option key={r} value={r}>{r}</option>)}
               </select>
            </label>
         </div>}
      </div>}
   </td>

}

export default ReportingTableRowCell
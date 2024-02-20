import React, { useEffect, useState, Fragment } from 'react'

import classNames from 'classnames'

import WaitingDots from '../../../components/WaitingDots'

import './HoursViewerDetails.scss'

const HoursViewerDetails = ({sourceHourItems}) => {

   const formRows = () => {

      let detailsRows = []

      console.log('sourceHourItems', sourceHourItems)

      sourceHourItems.forEach((shi) => {

         shi.days.forEach((d) => {

            if (d.hours > 0 || d.nonHours > 0) {

               detailsRows.push({
                  date: d.date,
                  user: shi.user,
                  region: shi.projectItem._list[0].region,
                  project: shi.projectItem._list[0].name,
                  hours: d.hours ? d.hours : 0,
                  nonHours: d.nonHours ? d.nonHours : 0,
                  approved: shi.approved ? 'Approved' : 'Pending Approval',
                  approvedBy: shi.approvedBy ? shi.approvedBy : '',
                  task: d.task ? d.task : '',
                  memo: d.memo ? d.memo : '',
                  country: d.region ? d.region : ''
               })

            }

         })

      })

      detailsRows.sort((a,b) => {
         if (a.date < b.date) return -1
         else if (a.date > b.date) return 1
         else {
           return a.user.localeCompare(b.user)
         }
      })

      return detailsRows
   }

   return <div className='hours-viewer-zone-details'>
      {!sourceHourItems && <div className='waiting'><WaitingDots message='Fetching Hours...'/></div>}
      {sourceHourItems && <table className="hours-viewer-detail-table">
         <thead>
            <tr>
               <th className='details-date-cell'>Date</th>
               <th>Employee</th>
               <th>Region</th>
               <th>Project</th>
               <th className='details-hours-cell'>Billable Time</th>
               <th className='details-hours-cell'>Non-Billable Time</th>
               <th>Approval Status</th>
               <th>Approved By</th>
               <th>Task</th>
               <th>Memo</th>
               <th>Country</th>
            </tr>
         </thead>
         <tbody>
            {formRows().map((r, i) => <tr key={i} className={classNames({even: i % 2 === 0})}>
               <td className='details-date-cell'>{r.date}</td>
               <td>{r.user}</td>
               <td>{r.region}</td>
               <td>{r.project}</td>
               <td className='details-hours-cell'>{r.hours}</td>
               <td className='details-hours-cell'>{r.nonHours}</td>
               <td>{r.approved}</td>
               <td>{r.approvedBy}</td>
               <td>{r.task}</td>
               <td>{r.memo}</td>
               <td>{r.country}</td>
            </tr>)}
         </tbody>
      </table>}
   </div>

}

export default HoursViewerDetails
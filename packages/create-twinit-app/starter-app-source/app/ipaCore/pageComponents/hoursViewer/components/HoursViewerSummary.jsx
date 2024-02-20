import React, { useEffect, useState, Fragment } from 'react'

import WaitingDots from '../../../components/WaitingDots'
import ApprovalButton from './ApprovalButton'

import './HoursViewerSummary.scss'

const monthNames = [
   'January', 'February', 'March', 'April', 'May', 'June', 'July',
   'August', 'September', 'October', 'November', 'December'
]

const HoursViewerSummary = ({hourInfos, unapprovedExist, handleApproval, role}) => {


   return <div className='hours-viewer-zone-summary'>
      {!hourInfos && <div className='waiting'><WaitingDots message='Fetching Hours...'/></div>}
      {hourInfos && <table className="hours-viewer-table">
         <colgroup>
            <col />
            <col width='25%' />
            <col className='report-billable-column'/>
            <col className='report-billable-column' />
            <col width='10%'/>
            <col className='report-billable-column' />
            <col className='report-billable-column' />
            <col />
         </colgroup>
         <thead>
            <tr>
               <th></th>
               <th></th>
               <th colSpan="2" className="report-project-header">Pending Approval</th>
               <th></th>
               <th colSpan="2" className="report-project-header">Approved</th>
               <th></th>
            </tr>
            <tr>
               <th></th>
               <th>Project</th>
               <th className="report-project-hours">Billable</th>
               <th className="report-project-hours">Non-Billable</th>
               <th>{(role !== "user" && unapprovedExist) && <ApprovalButton btnText='All' message='Approve all team member hours' onClick={() => handleApproval('all')} />}</th>
               <th className="report-project-hours">Billable</th>
               <th className="report-project-hours">Non-Billable</th>
               <th className="report-project-hours">Total</th>
            </tr>
         </thead>
         {!hourInfos.length && <tbody>
            <tr><td colSpan="7">No Hours Found For Month</td></tr>
         </tbody>}
         {!!hourInfos.length && <tbody>
            {hourInfos.map(hi => <Fragment key={hi.user}>
               <tr className="report-user-name">
                  <td colSpan="8">{hi.user}</td>
               </tr>
               {hi.hoursReported.map((hihr) => {

                  return hihr.projects.map(hihrp => <tr key={hihr.region+hihrp.project}>
                     <td className='report-project-region'>{hihr.region}</td>
                     <td className='report-project-name'>{hihrp.project}</td>
                     <td className='report-project-hours report-project-unapproved'>{hihrp.unapprovedHours}</td>
                     <td className='report-project-hours report-project-unapproved'>{hihrp.unapprovedNonHours}</td>
                     <td></td>
                     <td className='report-project-hours report-project-approved'>{hihrp.approvedHours}</td>
                     <td className='report-project-hours report-project-approved'>{hihrp.approvedNonHours}</td>
                     <td className='report-project-hours report-project-approved'>{hihrp.approvedHours + hihrp.approvedNonHours + hihrp.unapprovedHours + hihrp.unapprovedNonHours}</td>
                  </tr>) 
               })}
               <tr className="user-total">
                  <td></td>
                  <td className="report-user-name"></td>
                  <td className="report-user-name report-project-hours report-project-unapproved">{hi.unapprovedHours}</td>
                  <td className="report-user-name report-project-hours report-project-unapproved">{hi.unapprovedNonHours}</td>
                  <td className="report-user-name">
                     {(role !== "user" && (hi.unapprovedHours > 0 || hi.unapprovedNonHours > 0)) && <ApprovalButton btnText='' message={`Approve only ${hi.user}'s hours`} onClick={() => handleApproval(hi.userId)} />}
                  </td>
                  <td className="report-user-name report-project-hours report-project-approved">{hi.approvedHours}</td>
                  <td className="report-user-name report-project-hours report-project-approved">{hi.approvedNonHours}</td>
                  <td className="report-user-name report-project-hours report-project-approved">{hi.totalHours}</td>
               </tr>
            </Fragment>)}
         </tbody>}
      </table>}
   </div>
}

export default HoursViewerSummary
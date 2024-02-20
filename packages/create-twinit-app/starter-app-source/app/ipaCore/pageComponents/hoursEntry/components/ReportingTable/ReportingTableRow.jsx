import React, { useEffect, useState, useContext } from 'react'

import ReportingTableRowCell from './ReportingTableRowCell'
import { ToastContainer, useToast, SuccessToast, ErrorToast, WarningToast } from "@invicara/ipa-core/modules/IpaControls"

import { AdminContext } from '../../HoursEntryView'

import ProjectSelect from '../ProjectSelect'
import twinitUtils from '../../../utils/twinitUtils.mjs'

import './ReportingTableRow.scss'


const ReportingTableRow = ({row, onChange, onRemove, exclude}) => {

   const adminMode = useContext(AdminContext)

   const [ regions, setRegions ] = useState()

   const [ toasts, addToast ] = useToast()

   useEffect(() => {

         setRegionsIfRequired()

   }, [])

   const setRegionsIfRequired = async () => {

      let rowProject = row.projectItem._list[0]

      if (rowProject && rowProject.requiresRegion) {
         let regions

         try {
            regions = await twinitUtils.getAllRegions()
         } catch(err) {
            console.error(err)
            addToast({toast: <ErrorToast message='An error was encountered while fetching available regions. Please contact an Administrator.' />, delay: 7000})
            regions = []
         }
         console.log('regions', regions)
         setRegions(regions)
      }
      
   }

   const handleProjectChange = (newProjectName) => {
      if (onChange) onChange(row, null, {project: newProjectName})
   }

   const handlRevokeApproval = (e) => {
      e.preventDefault()
      if (onChange) onChange(row, null, {approved: false})
   }

   const handleDayChange = (day) => {
      if (onChange) onChange(row, day)
   }

   return <tr>
      <ToastContainer toasts={toasts} />
      <td className='table-row-project-name'>
         {!row._id && <div className='table-row-remove' onClick={() => onRemove(row)}><i className="fas fa-trash-alt"></i></div>}
         <div className="table-row-project-name-value">{row.project}</div>
         {adminMode && <ProjectSelect onChange={handleProjectChange} exclude={exclude}/> }
         {adminMode && row.approved && <a href="#" className="table-row-admin-revoke" onClick={handlRevokeApproval}>
            <i className="far fa-calendar-times"></i> Revoke Approval
         </a>}
      </td>
      {row.days.map(d => <ReportingTableRowCell key={d.date} day={d} 
         onChange={handleDayChange}
         approved={row.approved}
         requiresRegion={row.requiresRegion}
         regions={regions}
      />)}
      <td className="row-week-total">
         {row.days.reduce((acc, curr) => acc + (curr.hours ? parseFloat(curr.hours) : 0) + (curr.nonHours ? parseFloat(curr.nonHours) : 0), 0)}
      </td>
   </tr>

}

export default ReportingTableRow
import React, { useEffect, useState } from 'react'

import WaitingDots from '../../../components/WaitingDots'
import { ToastContainer, useToast, SuccessToast, ErrorToast, WarningToast } from "@invicara/ipa-core/modules/IpaControls"
import twinitUtils from '../../utils/twinitUtils.mjs'

import './ReporterSelect.scss'

const ReporterSelect = ({value, onChange}) => {

   const [ reporters, setReporters ] = useState(null)

   const [ toasts, addToast ] = useToast()

   useEffect(() => {

      fetchReporters()

   }, [])

   const fetchReporters = async () => {

      let reporters
      try {
         reporters = await twinitUtils.getHourReporterUsers()
         setReporters(reporters)
      } catch(err) {
         console.error(err)
         addToast({toast: <ErrorToast message='An error was encountered while fetching reporter users. Please contact an Administrator.' />, delay: 7000})
         setReporters([])
      }
   }

   const handleChange = (newValue) => {

      if (onChange) {
         let selectedReporterUser = reporters.find(r => r._id === newValue)
         onChange(selectedReporterUser)
      }

   }

   return <div className='reporter-select'>
      <ToastContainer toasts={toasts} />
      {!reporters && <WaitingDots message="Loading Reporter Users..." />}
      {reporters && <div>
         <label className='reporter-select-label'>Select a User
            <select value={value} onChange={(e) => handleChange(e.target.value)}>
               <option value='' disabled>Select a reporter</option>
               {reporters.map(r => <option key={r._id} value={r._id}>{`${r._firstname} ${r._lastname}`}</option>)}
            </select>
         </label>
      </div>}
   </div>
}

export default ReporterSelect
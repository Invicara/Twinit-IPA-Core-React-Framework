import React, { useEffect, useState } from 'react'

import WaitingDots from '../../../components/WaitingDots'
import { ToastContainer, useToast, SuccessToast, ErrorToast, WarningToast } from "@invicara/ipa-core/modules/IpaControls"

import twinitUtils from '../../utils/twinitUtils.mjs'

import './MonthSelect.scss'

const MonthSelect = ({month, onChange, disabled, latestMonths}) => {

   const [ months, setMonths ] = useState(null)

   const [ toasts, addToast ] = useToast()

   useEffect(() => {

      getLatestMonths()

   }, [])

   const getLatestMonths = async () => {

      let fetchedLatestMonths
      try {
         fetchedLatestMonths = await twinitUtils.getLatestMonths(latestMonths)
      } catch(err) {
         console.error(err)
         addToast({toast: <ErrorToast message='An error was encountered while fetching available months. Please contact an Administrator.' />, delay: 7000})
         fetchedLatestMonths = []
      }

      let monthArray = fetchedLatestMonths.reverse().map(m => m._name)

      let now = new Date()
      let year = now.getFullYear()
      let month = now.getMonth() + 1

      let thisMonthIndex = monthArray.findIndex(m => m === year + '-' + month)
      if (thisMonthIndex === -1) {thisMonthIndex = 0}

      setMonths(monthArray)
      handleChange(monthArray[thisMonthIndex])

   }

   const handleChange = (newValue) => {
      if (onChange) onChange(newValue)
   }

   return <div className='month-select'>
      <ToastContainer toasts={toasts}/>
      {!months && <WaitingDots message="Loading months..." />}
      {months && <div>
         <label className='month-select-label'>Select Month
            <select value={month} defaultValue={month} onChange={(e) => handleChange(e.target.value)} disabled={disabled}>
               {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
         </label>
      </div>}
   </div>
}

export default MonthSelect
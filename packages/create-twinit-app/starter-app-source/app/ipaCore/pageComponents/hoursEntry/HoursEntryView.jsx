import React, { useEffect, useState, createContext } from 'react'

import { IafPassSvc } from '@invicara/platform-api'

import { ToastContainer, useToast, SuccessToast, ErrorToast, WarningToast } from "@invicara/ipa-core/modules/IpaControls"

import ReporterSelect from './components/ReporterSelect'
import MonthWeekSelect from './components/MonthWeekSelect'
import ReportingTable from './components/ReportingTable/ReportingTable'
import twinitUtils from '../utils/twinitUtils.mjs'

import './HoursEntryView.scss'

export const AdminContext = createContext()

const HoursEntryView = (props) => {

   const [ selectedMonth, setSelectedMonth ] = useState()
   const [ selectedWeek, setSelectedWeek ] = useState()
   const [ existingHoursForWeek, setExistingHoursForWeek ] = useState(null)

   const [ unsavedChanges, setUnsavedChanges ] = useState(false)

   const [ busy, setBusy ] = useState(true)
   const [ isSaving, setIsSaving ] = useState(false)

   const [ isAdmin, setAdmin ] = useState(false)
   const [ overrideUser, setOverrideUser ] = useState(null)

   const [ toasts, addToast ] = useToast()

   useEffect(() => {

      checkAdmin()

   }, [])

   useEffect(() => {

      if (selectedWeek && overrideUser)
         handleWeekChange(selectedWeek, true)

   }, [overrideUser])

   const checkAdmin = async () => {

      let myUserGroups = await IafPassSvc.getUserGroups()
      let adminGroup = myUserGroups._list.find(u => u._name === 'Admin')
      setAdmin(!!adminGroup)

   }

   const handleMonthChange = (month) => {

      if (unsavedChangesExist()) {
         return
      } else {
         setSelectedMonth(month)
         setSelectedWeek(null)
         setUnsavedChanges(false)
         setBusy(false)
      }

   }

   const handleWeekChange = async (week, forceReload=false) => {

      if (!forceReload && unsavedChangesExist()) {
         return
      } else {
         setExistingHoursForWeek(null)
         setBusy(true)
         setSelectedWeek(week)
         setUnsavedChanges(false)

         let existingHours
         try {
            let fetchUserId = isAdmin && overrideUser ? overrideUser._id : 'me'
            existingHours = await twinitUtils.getExistingHoursForMonth(fetchUserId, selectedMonth, week)
         } catch(err) {
            console.error(err)
            addToast({toast: <ErrorToast message='An error was encountered while fetching previously submitted hours. Please contact an Administrator.' />, delay: 7000})
            return
         }

         existingHours.forEach(eh => {
            eh.project = eh.projectItem._list[0]?.name || 'ERROR PROJECT MISSING'
         })
         setExistingHoursForWeek(existingHours)
         setBusy(false)
         console.log(existingHours)
      }

   }

   const handleReporterChange = (user) => {

      setOverrideUser(user)

   }

   const handleTableChange = () => {
      setUnsavedChanges(true)
   }

   const unsavedChangesExist = () => {

      return unsavedChanges && !confirm('You have unsaved changes! All changes will be lost if you click OK. Do you wish to continue?')
   
   }

   const onSave = async (rows) => {

      function isMissingRegion(day) {

         if ((day.hours && day.hours > 0) || (day.nonHours && day.nonHours > 0)) {
            return (!day.region || day.region === '')
         }

         
      }

      if (!unsavedChanges) {
         addToast({toast: <WarningToast message='No changes need to be saved.' />, delay: 7000})
         return
      }

      setBusy(true)
      setIsSaving(true)

      let projectNames = []
      let errorProjectNames = []

      rows.forEach((r) => {
         projectNames.push(r.project)

         if (r.projectItem._list[0] && r.projectItem._list[0].requiresRegion) {

            for (let i = 0; i < r.days.length; i++) {

               if (isMissingRegion(r.days[i])) {
                  errorProjectNames.push(r.project)
                  break;
               }

            }

         }
      })

      if (errorProjectNames.length) {

         addToast({toast: <ErrorToast message={'These projects require a region to be provided: ' + errorProjectNames.join(' , ')} />, delay: 7000})
         setBusy(false)
         setIsSaving(false)
         return

      }

      let projects
      try {
         projects = await twinitUtils.getProjectsByName(projectNames)
      } catch(err) {
         console.error(err)
         addToast({toast: <ErrorToast message='An error was encountered while fetching projects. Changes have not been saved. Please contact an Administrator.' />, delay: 7000})
         return
      }

      let hourItems = rows.map((r) => {

         return {
            _id: r._id,
            approved: r.approved,
            userId: isAdmin && overrideUser ? overrideUser._id : props.user._id,
            user: isAdmin && overrideUser ? `${overrideUser._firstname} ${overrideUser._lastname}` : props.user._fullname,
            month: selectedMonth,
            week: selectedWeek,
            days: r.days.map(d => {
               const { dateObj, month, week, ...rest } = d
               return rest
            }),
            projectId: projects.find(p => p.name === r.project)._id,
            projectItem: r.projectItem
         }

      })

      let updateItems = hourItems.filter(hi => hi._id)
      let newItems = hourItems.filter(hi => !hi._id)

      try {
         if (newItems.length)
            await twinitUtils.saveNewHourItems(newItems)
      } catch(err) {
         console.error(err)
         addToast({toast: <ErrorToast message='An error was encountered while saving new hours. Changes may not have been saved. Please contact an Administrator.' />, delay: 7000})
      }
      
      try {
         if (updateItems.length)
            await twinitUtils.updateHourItems(updateItems)
      } catch(err) {
         console.error(err)
         addToast({toast: <ErrorToast message='An error was encountered while updating existing hours. Updates may not have been saved. Please contact an Administrator.' />, delay: 7000})
      }

      setUnsavedChanges(false)
      setBusy(false)
      setIsSaving(false)

      addToast({toast: <SuccessToast message='Your changes have been saved.' />, delay: 7000})
      handleWeekChange(selectedWeek, true)
   }

   return <AdminContext.Provider value={isAdmin}>
      <div className='hours-entry-view'>

         <ToastContainer toasts={toasts} />

         <div className='hev-greeting'>
            <div>Welcome {props.user._firstname}</div>
            <div>Enter Weekly Hours</div>
         </div>

         <div className='hev-control-zone'>
            <div className='hev-control-zone-left'>
               {isAdmin && <div className="hev-admin-ctrls">
                  <ReporterSelect value={overrideUser?._id ? overrideUser?._id : ''} onChange={handleReporterChange}/>
                  <hr />
               </div>}
               <MonthWeekSelect selectedMonth={selectedMonth} selectedWeek={selectedWeek} onMonthChange={handleMonthChange} onWeekChange={handleWeekChange} disabled={busy} />
               <div className='help-info-list'>
                  {props.handler.config?.helpInfos?.map((hi, i) =><div key={i} className='help-info'>
                     <div className='help-info-title'>{hi.title}</div>
                     <div className='help-info-content'>{hi.content}</div>
                  </div>)}
               </div>
            </div>
            <div className='hev-weekly-entry'>
               {selectedWeek && <ReportingTable month={selectedMonth} week={selectedWeek} 
                  existingHoursForWeek={existingHoursForWeek}
                  unsavedChanges={unsavedChanges}
                  onChange={handleTableChange}
                  onSave={onSave} isSaving={isSaving}
                  adminMode={isAdmin}
               />}
            </div>
         </div>

      </div>
   </AdminContext.Provider>
}

export default HoursEntryView
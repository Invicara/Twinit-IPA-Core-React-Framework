import React, { useEffect, useState, Fragment } from 'react'

import classNames from 'classnames'

import { IafDataPlugin } from '@invicara/ui-utils'

import { ToastContainer, useToast, SuccessToast, ErrorToast, WarningToast } from "@invicara/ipa-core/modules/IpaControls"

import MonthSelect from '../hoursEntry/components/MonthSelect'
import HoursViewerSummary from './components/HoursViewerSummary'
import HoursViewerDetails from './components/HoursViewerDetails'
import twinitUtils from '../utils/twinitUtils.mjs'

import './HoursViewerView.scss'

const monthNames = [
   'January', 'February', 'March', 'April', 'May', 'June', 'July',
   'August', 'September', 'October', 'November', 'December'
]

const HoursViewerView = (props) => {

   const [ mode, setMode ] = useState('summary')

   const [ selectedMonth, setSelectedMonth ] = useState(null)

   const [ sourceHourItems, setSourceHourItems ] = useState()

   const [ hourInfos, setHourInfos ] = useState(null)

   const [ busy, setBusy ] = useState(false)
   const [ unapprovedExist , setUnapprovedExist ] = useState(false)

   const [ toasts, addToast ] = useToast()

   useEffect(() => {

      if (selectedMonth) getHoursForMonth()

   }, [selectedMonth])

   const handleModeChange = (toMode) => {
      setMode(toMode)
   }

   const getHoursForMonth = async () => {

      function sumDayHours(days, hourField) {

         let total = 0

         days.forEach((day) => {
            if (day[hourField]) {
               
               let number = parseFloat(day[hourField])
               total += number

            }

            //have to deal with decimal issues because 
            // 0.91 will be 0.91000000000000001
            total = +total.toFixed(2)
         })

         return total

      }

      setBusy(true)
      setUnapprovedExist(false)

      let userids

      if (props.handler.config.role === 'user') {
         userids = 'me'
      } else if (props.handler.config.role === 'manager') {
         userids = 'myTeam'
      } else if (props.handler.config.role !== 'admin') {
         setHourInfos([])
         setBusy(false)
         return
      }

      let hours 
      try {
         hours = await twinitUtils.getExistingHoursForMonth(userids, selectedMonth)
      } catch(err) {
         console.error(err)
         addToast({toast: <ErrorToast message='An error was encountered while fetching team member hours. Please contact an Administrator.' />, delay: 7000})
         return
      }

      setSourceHourItems(hours)

      let userNames = []
      let userInfos = []

      hours.forEach((h) => {
         if (!userNames.includes(h.user)) {
            userNames.push(h.user)
            userInfos.push({
               user: h.user,
               userId: h.userId,
               hoursReported: [
                  {
                     region: h.projectItem?._list[0]?.region,
                     projects: [
                        {
                           project: h.projectItem?._list[0]?.name,
                           approvedHours: h.approved ? sumDayHours(h.days, 'hours') : 0,
                           approvedNonHours: h.approved ? sumDayHours(h.days, 'nonHours') : 0,
                           unapprovedHours: h.approved ? 0 : sumDayHours(h.days, 'hours'),
                           unapprovedNonHours: h.approved ? 0 : sumDayHours(h.days, 'nonHours'),
                        }
                     ]
                  }
               ]
            })
         } else {
            let userInfo = userInfos.find(ui => ui.user === h.user)
            
            let region = userInfo.hoursReported.find(hr => hr.region === h.projectItem?._list[0]?.region)

            if (!region) {
               userInfo.hoursReported.push({
                  region: h.projectItem?._list[0]?.region,
                     projects: [
                        {
                           project: h.projectItem?._list[0]?.name,
                           approvedHours: h.approved ? sumDayHours(h.days, 'hours') : 0,
                           approvedNonHours: h.approved ? sumDayHours(h.days, 'nonHours') : 0,
                           unapprovedHours: h.approved ? 0 : sumDayHours(h.days, 'hours'),
                           unapprovedNonHours: h.approved ? 0 : sumDayHours(h.days, 'nonHours'),
                        }
                     ]
               })
            } else {
               
               let project = region.projects.find(ps => ps.project === h.projectItem?._list[0]?.name)

               if (!project) {
                  region.projects.push({
                     project: h.projectItem?._list[0]?.name,
                     approvedHours: h.approved ? sumDayHours(h.days, 'hours') : 0,
                     approvedNonHours: h.approved ? sumDayHours(h.days, 'nonHours') : 0,
                     unapprovedHours: h.approved ? 0 : sumDayHours(h.days, 'hours'),
                     unapprovedNonHours: h.approved ? 0 : sumDayHours(h.days, 'nonHours'),
                  })
               } else {

                  if (h.approved) {
                     project.approvedHours += sumDayHours(h.days, 'hours')
                     project.approvedNonHours += sumDayHours(h.days, 'nonHours')
                  }
                  else {
                     project.unapprovedHours += sumDayHours(h.days, 'hours')
                     project.unapprovedNonHours += sumDayHours(h.days, 'nonHours')
                  }
               }
            }
         }
      })

      userInfos.forEach((ui) => {

         let totalHours = 0
         let unapprovedHours = 0
         let unapprovedNonHours = 0
         let approvedHours = 0
         let approvedNonHours = 0

         ui.hoursReported.forEach((hr) => {

            hr.projects.forEach((proj) => {

               totalHours += proj.approvedHours + proj.approvedNonHours + proj.unapprovedHours + proj.unapprovedNonHours
               unapprovedHours += proj.unapprovedHours
               unapprovedNonHours += proj.unapprovedNonHours
               approvedHours += proj.approvedHours
               approvedNonHours += proj.approvedNonHours

            })

         })

         ui.totalHours = totalHours
         ui.unapprovedHours = unapprovedHours
         ui.unapprovedNonHours = unapprovedNonHours
         ui.approvedHours = approvedHours
         ui.approvedNonHours = approvedNonHours
         if (ui.unapprovedHours > 0 || ui. unapprovedNonHours > 0) setUnapprovedExist(true)

      })

      console.log(hours, userInfos)

      setHourInfos(userInfos)
      setBusy(false)

   }

   const handleMonthChange = (month) => {

      setHourInfos(null)
      setSelectedMonth(month)

   }

   const handleApproval = async (approveFor) => {

      let approveThese

      if (approveFor === 'all') {

         approveThese = [...sourceHourItems]

      } else {

         approveThese = sourceHourItems.filter(si => si.userId === approveFor)
         
      }

      approveThese.forEach(uh => {
         uh.approved = true
         uh.approvedById = props.user._id
         uh.approvedBy = props.user._fullname
      })

      try {
         await twinitUtils.updateHourItems(approveThese)
         addToast({toast: <SuccessToast message='Approvals successfully saved.' />, delay: 7000})
      } catch(err) {
         console.error(err)
         addToast({toast: <ErrorToast message='An error was encountered while approving team member hours. Please contact an Administrator.' />, delay: 7000})
      }
      
      setHourInfos(null)
      getHoursForMonth()

   }

   const exportHours = async (e) => {

      e.preventDefault()
      setBusy(true)

      let year = selectedMonth.split('-')[0]
      let month = selectedMonth.split('-')[1]
      let monthName = monthNames[month-1]

      let summaryRows = []

      summaryRows.push(['Invicara Holding Ltd', '', '', '', ''])
      summaryRows.push(['Invicara Holding (Consolidated)', '', '', '', ''])
      summaryRows.push(['Time by Employee', '', '', '', ''])
      summaryRows.push([`${monthName} ${year}`, '', '', '', ''])
      summaryRows.push(['', '', '', '', ''])
      summaryRows.push(['', '', '', '', ''])
      summaryRows.push(['Employee', 'Region', 'Project', 'Pending Billable', 'Pending Non-Billable', 'Approved Billable', 'Approved Non-Billable', 'Total'])

      hourInfos.forEach((hi) => {
         summaryRows.push([hi.user, '', '',' ', ''])

         hi.hoursReported.forEach((hr) => {

            hr.projects.forEach((p) => {

               summaryRows.push(['', hr.region, p.project, p.unapprovedHours, p.unapprovedNonHours, p.approvedHours, p.approvedNonHours, p.unapprovedHours+p.approvedHours+p.unapprovedNonHours+p.approvedNonHours])

            })

         })

         summaryRows.push([`${hi.user} Totals:`, '', '',  hi.unapprovedHours, hi.unapprovedNonHours, hi.approvedHours, hi.approvedNonHours, hi.totalHours])
      })

      let detailsRows = []

      console.log('sourceHourItems', sourceHourItems)

      sourceHourItems.forEach((shi) => {

         shi.days.forEach((d) => {

            if (d.hours > 0 || d.nonHours > 0) {

               detailsRows.push([
                  year,
                  month,
                  d.date,
                  shi.user,
                  shi.projectItem._list[0] && shi.projectItem._list[0].region ? shi.projectItem._list[0].region : 'Unknown',
                  shi.projectItem._list[0] && shi.projectItem._list[0].name ? shi.projectItem._list[0].name : 'Unknown',
                  d.hours,
                  d.nonHours,
                  shi.approved ? 'Approved' : 'Pending Approval',
                  shi.approvedBy ? shi.approvedBy : '',
                  d.task ? d.task : '',
                  d.memo ? d.memo : '',
                  d.region ? d.region : ''
               ])

            }

         })

      })

      detailsRows.sort((a,b) => {
         if (a[2] < b[2]) return -1
         else if (a[2] > b[2]) return 1
         else return 0
      })

      detailsRows.unshift([
         'Year',
         'Month',
         'Date',
         'Employee',
         'Region',
         'Project',
         'Billable Time',
         'Non-Billable Time',
         'Approval Status',
         'Approved By',
         'Task',
         'Memo',
         'Country'
      ])


      let sheetArrays = [
         {
            sheetName: `Summary ${selectedMonth}`,
            arrays: summaryRows
         },
         {
            sheetName: `Details ${selectedMonth}`,
            arrays: detailsRows
         },
      ]
   
     try {
         let workbook = await IafDataPlugin.createWorkbookFromAoA(sheetArrays);
         await IafDataPlugin.saveWorkbook(
               workbook,
               `${selectedMonth} Hours Export.xlsx`
         )
      } catch(e) {
         console.log(e)
         return e
      }

      setBusy(false)
   }


   return <div className='hours-viewer-view'>
      <ToastContainer toasts={toasts} />
      <div className='hev-greeting'>
         <div>Welcome {props.user._firstname}</div>
         <div>{props.handler.config.role === 'user' ? 'View My Hours' : props.handler.config.role === 'manager' ? 'Approve Hours' : 'All Hours'}</div>
      </div>

      <div className='hours-view-zone'>
         <div className="hev-calendar">
            <MonthSelect month={selectedMonth} latestMonths={props.handler.config.role === 'user' ? 6 : 13} onChange={handleMonthChange} disabled={busy} />
            <div className="hev-download">
               {!busy && hourInfos && <a href="" onClick={exportHours}><i className="fas fa-file-download fa-2x"></i> Export Report</a>}
            </div>
         </div>
         <div className="hours-view-zone-data">
            <div className="mode-selector">
               <div className='mode-label'>View:</div>
               <label className={classNames('mode', {selected: mode === 'summary' })}>
                  <input disabled={busy} type="radio" value={'summary'} checked={mode === 'summary'} name="mode-selector" onChange={() => handleModeChange('summary')} />
                  Summary
               </label>
               <label className={classNames('mode', {selected: mode === 'details' })}>
                  <input disabled={busy} type="radio" value={'details'} checked={mode === 'details'} name="mode-selector" onChange={() => handleModeChange('details')} />
                  Details
               </label>
            </div>
            <hr />
            {mode === 'summary' && <HoursViewerSummary hourInfos={hourInfos} 
               unapprovedExist={unapprovedExist} 
               handleApproval={handleApproval} 
               role={props.handler.config.role}
            />}
            {mode === 'details' && <HoursViewerDetails sourceHourItems={sourceHourItems}/>}
         </div>
      </div>
   </div>
}

export default HoursViewerView
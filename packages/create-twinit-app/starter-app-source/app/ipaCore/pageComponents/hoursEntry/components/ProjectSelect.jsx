import React, { useEffect, useState } from 'react'

import WaitingDots from '../../../components/WaitingDots'
import { ToastContainer, useToast, SuccessToast, ErrorToast, WarningToast } from "@invicara/ipa-core/modules/IpaControls"
import twinitUtils from '../../utils/twinitUtils.mjs'

import './ProjectSelect.scss'

const localRecentsKey = 'hoursRecentProjects'
const localExpiryDays = 21

const ProjectSelect = ({onChange, exclude}) => {

   const [ recentProjects, setRecentProjects ] = useState(null)
   const [ customerProjects, setCustomerProjects ] = useState(null)
   const [ internalProjects, setInternalProjects ] = useState(null)
   const [ value, setValue ] = useState('')

   const [ toasts, addToast ] = useToast()

   useEffect(() => {
   
      if (!getLocalRecents()) {
         setLocalRecents({})
      }

      fetchProjects()
   }, [])

   const getLocalRecents = () => {
      let localRecents = localStorage.getItem(localRecentsKey)
      if (!localRecents) {
         return null
      } else {
         let recents = JSON.parse(localRecents)
         let now = new Date().getTime()

         for ( const [project, lastUsed] of Object.entries(recents)) {

            let timeDiff = now - new Date(lastUsed).getTime()
            let daysBetween = timeDiff/(1000*60*60*24)
            console.log('daysbetween', daysBetween)
   
            if (daysBetween > localExpiryDays) {
               delete recents[project]
            }
         }
   
         setLocalRecents(recents)
         return recents
      }
   }

   const getRecentProjectNames = () => {
      let recents = getLocalRecents()
      if (recents) return Object.keys(recents)
      else return []
   }

   const setLocalRecents = (recents) => {
      localStorage.setItem(localRecentsKey, JSON.stringify(recents))
   }

   const fetchProjects = async () => {

      let projNames
      try {
         projNames = await twinitUtils.getProjectNames()
      } catch(err) {
         console.error(err)
         addToast({toast: <ErrorToast message='An error was encountered while fetching available projects. Please contact an Administrator.' />, delay: 7000})
         projNames = {
            cusProjects: [],
            intProjects: []
         }
      }

      let recentLocalProjects = getRecentProjectNames()
      // recent projects can get stale so make sure they still exst before showing in the UI
      let recentExistingProjects = recentLocalProjects.filter(rlp => {
         return projNames.cusProjects.includes(rlp) || projNames.intProjects.includes(rlp)
      })

      setRecentProjects(recentExistingProjects.sort())
      setCustomerProjects(projNames.cusProjects.filter(cp => !recentLocalProjects.includes(cp)).sort())
      setInternalProjects(projNames.intProjects.filter(ip => !recentLocalProjects.includes(ip)).sort())
   }

   const handleChange = (newValue) => {

      let recentProjects = getLocalRecents()
      if (recentProjects) {
         recentProjects[newValue] = new Date().toISOString()
         setLocalRecents(recentProjects)
      }

      if (onChange) onChange(newValue)
      setValue('')
   }

   return <div className='project-select'>
      <ToastContainer toasts={toasts} />
      {!customerProjects && !internalProjects && <WaitingDots message="Loading Projects" />}
      {customerProjects && internalProjects && <div>
         <select value={value} onChange={(e) => handleChange(e.target.value)}>
            <option value='' disabled>Select a project</option>
            <optgroup label="Recent Projects">
               {recentProjects.map((p) => {
                  if (!exclude || !exclude.includes(p))
                     return <option key={p} value={p}>{p}</option>
               })}
            </optgroup>
            <optgroup label="Customer Projects">
               {customerProjects.map((p) => {
                  if (!exclude || !exclude.includes(p))
                     return <option key={p} value={p}>{p}</option>
               })}
            </optgroup>
            <optgroup label="Internal">
               {internalProjects.map((p) => {
                  if (!exclude || !exclude.includes(p))
                     return <option key={p} value={p}>{p}</option>
               })}
            </optgroup>
         </select>
      </div>}
   </div>
}

export default ProjectSelect
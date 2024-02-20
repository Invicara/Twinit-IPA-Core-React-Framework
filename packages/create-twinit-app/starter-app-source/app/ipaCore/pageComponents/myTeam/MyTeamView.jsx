import React, { useEffect, useState } from 'react'

import WaitingDots from '../../components/WaitingDots'

import DualListBox from 'react-dual-listbox'
import { ToastContainer, useToast, SuccessToast, ErrorToast, WarningToast } from "@invicara/ipa-core/modules/IpaControls"

import twinitUtils from '../utils/twinitUtils.mjs'

import './MyTeamView.scss'
import '../../../../node_modules/react-dual-listbox/src/scss/react-dual-listbox.scss'

const MyTeamView = (props) => {

   const [ allReporters, setAllReporters ] = useState()
   const [ availableUsers, setAvailableUsers ] = useState()

   const [ myTeamIds, setMyTeamIds ] = useState()
   const [ myUpdatedTeamIds, setMyUpdatedTeamIds ] = useState()

   const [ isSaving, setIsSaving ] = useState(false)

   const [ toasts, addToast ] = useToast()
   
   useEffect(() => {

      getAllReporterUsers()

   }, [])

   const getAllReporterUsers = async () => {

      let allUsers, myTeamMemberIds, assignedUserIds

      try {
         allUsers = await twinitUtils.getHourReporterUsers()
         assignedUserIds = await twinitUtils.getUserIdsAssignedToTeams()
         myTeamMemberIds = await twinitUtils.getUserIdsAssignedToTeams('me')
   
      } catch(err) {
         console.error(err)
         addToast({toast: <ErrorToast message='An error was encountered while fetching users. Please contact an Administrator.' />, delay: 7000})
         allUsers = []
      }

      setAllReporters(allUsers)
      if (!assignedUserIds) assignedUserIds = []
      if (!myTeamMemberIds) myTeamMemberIds = []
      let availableUsers = []

      // available users for the dual list control are any user not already assigned to
      // another team or if they are currently on my team
      allUsers.forEach((user) => {
         if (!assignedUserIds.includes(user._id) || myTeamMemberIds.includes(user._id)) {
            availableUsers.push(user)
         }
      })

      setMyTeamIds(myTeamMemberIds)
      setMyUpdatedTeamIds(myTeamMemberIds)
      setAvailableUsers(availableUsers)

   }

   const handleChange = (userids) => {
      setMyUpdatedTeamIds(userids)
   }

   const onCancel = () => {
      setMyUpdatedTeamIds(myTeamIds)
   }

   const onSave = async () => {

      let didError = false

      setIsSaving(true)

      let removedFromTeam = myTeamIds.filter(mytid => !myUpdatedTeamIds.includes(mytid))
      let addedToTeam = myUpdatedTeamIds.filter(myutid => !myTeamIds.includes(myutid))

      try {
         await twinitUtils.manageMyTeamMembers(addedToTeam, removedFromTeam)
      } catch(err) {
         console.error(err)
         addToast({toast: <ErrorToast message='An error was encountered while saving team changes. Please contact an Administrator.' />, delay: 7000})
         didError = true
      }
      
      setMyTeamIds(null)
      setMyUpdatedTeamIds(null)
      setAvailableUsers(null)
      setAllReporters(null)
      setIsSaving(false)

      if (!didError)
         addToast({toast: <SuccessToast message='Team changes were saved.' />, delay: 7000})

      getAllReporterUsers()
   }


   return <div className='my-team-view'>
      <ToastContainer toasts={toasts} />
      <div className='hev-greeting'>
         <div>Welcome {props.user._firstname}</div>
         <div>My Team</div>
      </div>

      <div className="my-team-view-content">

         {(!myUpdatedTeamIds || isSaving) && <WaitingDots message={isSaving ? "Saving your team changes..." : "Loading your team..."} />}

         {myUpdatedTeamIds && !isSaving && <DualListBox
            options={availableUsers ? availableUsers.map((ua) => { return { value: ua._id, label: ua._firstname + ' ' + ua._lastname}}) : []}
            selected={myUpdatedTeamIds ? myUpdatedTeamIds : []}
            onChange={handleChange}
            showHeaderLabels={true}
         />}

         {myUpdatedTeamIds && !isSaving && <div className='team-controls'>
            <div className='team-cancel-btn' onClick={onCancel}>Reset</div>
            <div className='team-save-btn' onClick={onSave}>Save</div>
         </div>}

      </div>

   </div>
}

export default MyTeamView
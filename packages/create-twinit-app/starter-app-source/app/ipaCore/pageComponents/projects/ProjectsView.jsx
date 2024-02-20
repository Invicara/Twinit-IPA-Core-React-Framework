import React, { useEffect, useState } from 'react'

import { ToastContainer, useToast, SuccessToast, ErrorToast, WarningToast } from "@invicara/ipa-core/modules/IpaControls"

import ProjectTableAddRow from './components/ProjectTableAddRow'
import ProjectTableRow from './components/ProjectTableRow'
import twinitUtils from '../utils/twinitUtils.mjs'

import './ProjectsView.scss'

const ProjectsView = (props) => {

   const [ projects, setProjects ] = useState([])

   const [ toasts, addToast ] = useToast()

   useEffect(() => {
      fetchProjects()
   },[])

   const fetchProjects = async () => {

      let projects
      try {
         projects = await twinitUtils.getProjects()
         projects.sort((a,b) => {
            return a.name.localeCompare(b.name)
         })
         setProjects(projects)

      } catch(err) {
         console.error(err)
         addToast({toast: <ErrorToast message='An error was encountered while fetching projects. Please contact an Administrator.' />, delay: 7000})
      }

   }

   const sendToast = (sendThisToast, error) => {

      if (error) console.error(error)
      addToast(sendThisToast)

   }

   
   return <div className='projects-table-wrapper'>
      <ToastContainer toasts={toasts} />
      <table className='projects-table'>
         <colgroup>
            <col width="10%" />
            <col />
            <col width="15%" />
            <col width="15%" className='center-content' />
            <col width="20%" />
         </colgroup>
         <thead>
            <tr>
               <th></th>
               <th>Name</th>
               <th>Region</th>
               <th className='center-content'>Require User Entered Region</th>
               <th>Status</th>
            </tr>
         </thead>
         <tbody>
            <ProjectTableAddRow onChange={fetchProjects} sendToast={sendToast}/>
            {projects.map((p, i) => <ProjectTableRow key={p._id} project={p} rowNum={i} onChange={fetchProjects} sendToast={sendToast}/>)}
         </tbody>
      </table>
   </div>

}

export default ProjectsView
import React, { useEffect, useState } from 'react'

import classNames from 'classnames'
import Switch from 'react-switch'

import { SuccessToast, ErrorToast, WarningToast } from "@invicara/ipa-core/modules/IpaControls"

import twinitUtils from '../../utils/twinitUtils.mjs'

import './ProjectTableRow.scss'


const ProjectTableRow = ({project , rowNum, onChange, sendToast}) => {

   const [ editing, setEditing ] = useState(false)

   const [ newRegion, setNewRegion ] = useState(null)
   const [ newName, setNewName ] = useState(null)

   const [ isSaving, setIsSaving ] = useState(false)

   useEffect(() => {
      setNewRegion(project.region)
      setNewName(project.name)
   }, [])

   const switchActive = async (project) => {

      let updatedProject = structuredClone(project)
      if (updatedProject.status === 'active')
         updatedProject.status='inactive'
      else
         updatedProject.status='active'
      
      try {
         await twinitUtils.updateProject(updatedProject)
         sendToast({toast: <SuccessToast message={`${updatedProject.name} was set to ${updatedProject.status}.`} />, delay: 7000})
      } catch(err) {
         sendToast({toast: <ErrorToast message={`An error was encountered while changing ${updatedProject.name} to ${updatedProject.status}. Please contact an Administrator.`} />, delay: 7000}, err)
      }

      if (onChange) onChange()
   }

   const toggleRequiresRegion = async (project) => {

      let updatedProject = structuredClone(project)

      updatedProject.requiresRegion = !updatedProject.requiresRegion

      try {
         await twinitUtils.updateProject(updatedProject)
         sendToast({toast: <SuccessToast message={`${updatedProject.name} was set to ${updatedProject.requiresRegion ? 'require a user entered region' : 'not require a user entered region'}.`} />, delay: 7000})
      } catch(err) {
         sendToast({toast: <ErrorToast message={`An error was encountered while changing required region for ${updatedProject.name}. Please contact an Administrator.`} />, delay: 7000}, err)
      }

      if (onChange) onChange()

   }

   const handleUpdate = (type, value) => {

      if (type === 'name') setNewName(value)
      else setNewRegion(value)

   }

   const saveChanges = async () => {

      setIsSaving(true)

      let updatedProject = structuredClone(project)
      updatedProject.name = newName
      updatedProject.region = newRegion

      try {
         await twinitUtils.updateProject(updatedProject)
         sendToast({toast: <SuccessToast message={`${updatedProject.name} was successfully updated`} />, delay: 7000})
      } catch(err) {
         sendToast({toast: <ErrorToast message={`An error was encountered while updating ${updatedProject.name}. Please contact an Administrator.`} />, delay: 7000}, err)
      }

      if (onChange) await onChange()

      setIsSaving(false)
      setEditing(false)
   }

   const cancelChanges = () => {

      setNewRegion(project.region)
      setNewName(project.name)
      setEditing(false)

   }

   return <tr key={project._id} className={classNames({'even-row': rowNum % 2 === 0})}>
      <td className='row-control-cell'>
         {!editing && <div onClick={() => setEditing(true)}><i className="fas fa-edit"></i></div>}
         {editing && <div className='editing-controls'>
            <div onClick={saveChanges}><i className="fas fa-save"></i></div>
            <div onClick={cancelChanges}><i className="fas fa-times-circle"></i></div>
         </div>}
      </td>
      <td>
         {!editing && <span>{project.name}</span>}
         {editing && <input className="input-text" type='text' value={newName} onChange={(e) => handleUpdate('name', e.target.value)} disabled={isSaving} />}
      </td>
      <td>
         {!editing && <span>{project.region}</span>}
         {editing && <input className="input-text" type='text' value={newRegion} onChange={(e) => handleUpdate('region', e.target.value)} disabled={isSaving} />}
      </td>
      <td className='center-content'>
         {!editing && <input type='checkbox' checked={project.requiresRegion} onChange={() => toggleRequiresRegion(project)}/>}
      </td>
      <td>
         {!editing && <label>
            <Switch onChange={() => switchActive(project)} checked={project.status === 'active'} />
         </label>}
      </td>
   </tr>

}

export default ProjectTableRow
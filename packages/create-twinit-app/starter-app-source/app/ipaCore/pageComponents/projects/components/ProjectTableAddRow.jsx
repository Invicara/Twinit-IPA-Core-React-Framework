import React, { useEffect, useState } from 'react'

import { SuccessToast, ErrorToast, WarningToast } from "@invicara/ipa-core/modules/IpaControls"

import twinitUtils from '../../utils/twinitUtils.mjs'

import './ProjectTableAddRow.scss'


const ProjectTableAddRow = ({onChange, sendToast}) => {

   const [ name, setName ] = useState('')
   const [ region, setRegion ] = useState('')

   const [ isSaving, setIsSaving ] = useState(false)

   const handleUpdate = (type, value) => {

      if (type === 'name')
         setName(value)
      else
         setRegion(value)

   }

   const saveChanges = async () => {

      setIsSaving(true)

      try {
         await twinitUtils.createProject(name, region)
         sendToast({toast: <SuccessToast message='New project created.'/>, delay: 7000})
      } catch(err) {
         sendToast({toast: <ErrorToast message='An error was encountered while saving the projects. Please contact an Administrator.'/>, delay: 7000}, err)
      }
      cancelChanges()
      setIsSaving(false)

      if (onChange) onChange()

   }

   const cancelChanges = () => {

      setName('')
      setRegion('')

   }

   return <tr className="add-row">
      <td className='row-control-cell'>
         {!isSaving && <div className='editing-controls'>
            {(name && region) && <div onClick={saveChanges}><i className="fas fa-save"></i></div>}
            {(name || region) && <div onClick={cancelChanges}><i className="fas fa-times-circle"></i></div>}
         </div>}
         {isSaving && <div>Saving...</div>}
      </td>
      <td>
         <input className="new-input-text" type='text' 
            value={name} 
            onChange={(e) => handleUpdate('name', e.target.value)} 
            disabled={isSaving}
            placeholder='New project name'
         />
      </td>
      <td>
         <input className="new-input-text" type='text' 
            value={region} 
            onChange={(e) => handleUpdate('region', e.target.value)} 
            disabled={isSaving} 
         />
      </td>
      <td>
        
      </td>
   </tr>

}

export default ProjectTableAddRow
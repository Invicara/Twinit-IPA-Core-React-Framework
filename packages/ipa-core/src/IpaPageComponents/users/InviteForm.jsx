import React, { useState} from "react";
import clsx from "clsx";

import './InviteForm.scss'

export const InviteForm  = ({user, isCurrentUser=false, selectable=false, isSelected=false, onClick}) => {

  const [currentEmail, setCurrentEmail] = useState("")
  const [allEmails, setAllEmails] = useState([])

  const handleEmailChange = (event) => {
    setCurrentEmail(event.target.value.toLowerCase())
  }

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  return <div className='invite-form'>
    <input type='text' value={currentEmail} onChange={handleEmailChange}></input>
  </div>

}
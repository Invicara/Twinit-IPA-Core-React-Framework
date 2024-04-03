import React from "react"

import './OMAPICardError.scss'

export const OMAPICardError  = ({error}) => {

  return <div>
    {error && <div className='card-error-msg'>{error}</div>}
  </div>
  

}
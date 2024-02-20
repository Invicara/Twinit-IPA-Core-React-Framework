import React, { useEffect, useState, Fragment } from 'react'
import { ThreeDots} from 'react-loader-spinner'

const WaitingDots = ({message}) => { 

   return <div><ThreeDots
   visible={true}
   height="80"
   width="80"
   color="var(--app-accent-color)"
   radius="9"
   ariaLabel="three-dots-loading"
   /> {message}
</div>
}

export default WaitingDots
import React, { useEffect, useState } from 'react'

import classNames from 'classnames'

import WaitingDots from '../../../components/WaitingDots'

import './WeekSelect.scss'

const WeekSelect = ({month, week, onChange, disabled}) => {

   const [ weeks, setWeeks ] = useState(null)

   useEffect(() => {

      getWeeksInMonth(month)
     
   }, [month])

   const getWeeksInMonth = (monthForWeeks) => {

      let year = monthForWeeks.split('-')[0]
      let month = monthForWeeks.split('-')[1] - 1
    
      const weeks = []
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      let dayOfWeek = firstDay.getDay()
      let start
      let end
    
      for (let i = 1; i < daysInMonth+1; i++) {
    
        if (dayOfWeek === 0 || i === 1) {
          start = i
        }
    
        if (dayOfWeek === 6 || i === daysInMonth) {
    
          end = i
    
          if(start){
            weeks.push({
              'start': start,
              'end': end
            });
            start = null
          }
        }
    
        dayOfWeek = new Date(year, month, i + 1).getDay()
      }

      setWeeks(weeks)
      console.log(weeks)
    }

   const handleChange = (newValue) => {

      if (onChange) onChange(JSON.parse(newValue))

   }

   return <div className='week-select'>
      {!weeks && <WaitingDots message="Loading weeks..." />}
      {weeks && <div className='week-wrapper'>
         <div className='week-header'>Select Week</div>
         <div className='week-header'>Start Date - End Date</div>
         <div className='week-radios'>
            {weeks.map(w => <label key={w.start} className={classNames({selected: JSON.stringify(week) === JSON.stringify(w)})}>
               <input disabled={disabled} type="radio" value={JSON.stringify(w)} checked={JSON.stringify(week) === JSON.stringify(w)} name="week-start-end" onChange={(e) => handleChange(e.target.value)}/>
               {w.start} to {w.end}
            </label>)}
         </div>
      </div>}
   </div>
}

export default WeekSelect
import React, { useEffect, useState } from 'react'

import MonthSelect from './MonthSelect'
import WeekSelect from './WeekSelect'

import './MonthWeekSelect.scss'

const MonthWeekSelect = ({selectedMonth, selectedWeek, disabled, onMonthChange, onWeekChange}) => {

return <div className='hev-calendar'>
   <MonthSelect month={selectedMonth} onChange={onMonthChange} disabled={disabled} />
   {selectedMonth && <WeekSelect month={selectedMonth} week={selectedWeek} onChange={onWeekChange} disabled={disabled} />}
</div>


}

export default MonthWeekSelect
import React from "react";
import clsx from "clsx";
import moment from 'moment'

import './DatasourceHistoryTable.scss'

export const DatasourceHistoryTable  = ({runs}) => {

  const getFormattedDate = (stamp) => {
    let rundate = moment(parseInt(stamp))
    return rundate.format('MMM D YYYY kk:mm:ss')
  }

  const sortRuns = () => {
    if (runs) return [...runs].sort((a,b) => parseInt(b._createdat) - parseInt(a._createdat))
    else return null
  }

  return  <table className='datasource-history-table'>
                <thead>
                  <tr>
                    <th>Run at</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortRuns().map((run) => {
                    return <tr key={run.id} className={clsx(run._status === "ERROR" && 'error')}>
                      <td className='stamp'>{getFormattedDate(run._createdat)}</td>
                      <td className='status'>{run._status}</td>
                    </tr>}
                  )}
                </tbody>
              </table>
}
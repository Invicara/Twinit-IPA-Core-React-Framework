import React from 'react'
import Cell from './Cell'
import './Table.scss'

export default function Table ({rows, className, headers, options}) {
    
  const hasData = rows && rows.length > 0
  return (
    <table className={className}>
      <tbody>
        {headers && (
          <tr>
            {headers?.map((header, idx) => {
              return (
                <th key={idx}>
                  <Cell type='text' val={header} key={idx}/>
                </th>
              )
            })}
          </tr>
        )}

        {hasData &&
          rows.map((row, idx) => (
            <tr key={idx}> 
              {row.map((cell, idx) => (
                <td key={idx}>
                  <Cell type={cell.type} val={cell.val} className={cell.className} key={idx}/>
                </td>
              ))}
            </tr>
          ))}
        {!hasData && (
          <tr>
            <td colSpan={headers?.length} className={`table__empty-message ${options?.emptyMessageClassName || ""}`}>
              {options?.emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}


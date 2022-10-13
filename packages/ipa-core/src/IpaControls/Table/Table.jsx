import React, {useState} from 'react'
import { propsEqual } from '../../IpaUtils/compare'
import Cell from './Cell'
import './Table.scss'
import {RadioButtonUnchecked as UncheckedCircle, RadioButtonChecked as CheckedRadioCircle} from "@material-ui/icons";

export default function Table ({rows, className, headers, checkbox, options, collectionSelect}) {
  const [selected, setSelected] = useState(0)

  const selectedCell = (idx) => {
    collectionSelect(idx)
    setSelected(idx)
  }

  function checkboxCell(idx) {
    return (
      <td>
          {idx === selected ? <CheckedRadioCircle style={{color: '#C71784', cursor: 'pointer'}}/> :
          <UncheckedCircle style={{cursor: 'pointer'}} onClick={() => selectedCell(idx)} />}
      </td>
    )
  }
    
  const hasData = rows && rows.length > 0
  return (
    <table className={className}>
      <tbody>
        {headers && (
          <tr>
            {checkbox && 
              <th>
                <Cell />
              </th>
            }
            {headers?.map(header => {
              return (
                <th key={header}>
                  <Cell type='text' val={header} />
                </th>
              )
            })}
          </tr>
        )}

        {hasData &&
          rows.map((row, idx) => (
            <tr key={idx}> 
            {checkbox && 
              checkboxCell(idx)
            }
              {row.map((cell, idx) => (
                <td key={idx}>
                  <Cell type={cell.type} val={cell.val} className={cell.className} />
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


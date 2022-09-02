import React from 'react'
import Cell from './Cell'
import './Table.scss'
export default function Table (props) {
  console.log('Table props', props)

  const hasData = props.rows && props.rows.length > 1

  return (
    <table className={props.className}>
      {props.headers && (
        <tr>
          {props.headers?.map(h => {
            return (
              <th>
                <Cell type='text' val={h} />
              </th>
            )
          })}
        </tr>
      )}

      {hasData &&
        props.rows.map(r => (
          <tr>
            {r.map(c => (
              <td>
                <Cell type={c.type} val={c.val} className={c.className} />
              </td>
            ))}
          </tr>
        ))}
      {!hasData && props.options?.emptyMessage}
    </table>
  )
}

/**
 * ****************************************************************************
 *
 * INVICARA INC CONFIDENTIAL __________________
 *
 * Copyright (C) [2012] - [2019] INVICARA INC, INVICARA Pte Ltd, INVICARA INDIA
 * PVT LTD All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains the property of
 * Invicara Inc and its suppliers, if any. The intellectual and technical
 * concepts contained herein are proprietary to Invicara Inc and its suppliers
 * and may be covered by U.S. and Foreign Patents, patents in process, and are
 * protected by trade secret or copyright law. Dissemination of this information
 * or reproduction of this material is strictly forbidden unless prior written
 * permission is obtained from Invicara Inc.
 */

import React from "react";
import _ from 'lodash';
import FileHelpers from '../IpaUtils/FileHelpers'
import {isValidUrl} from '../IpaUtils/helpers'

import { getRandomString } from "../IpaUtils/helpers"

import './SimpleTable.scss'


const SimpleTable = ({header, rows, objects, columns, className}) => {
  let keyBase = getRandomString("st_") + "_"
  let i=0
  let key = () => keyBase + "_" + i++

  if (!rows && Array.isArray(objects) && columns) {
    let tinfo = objectsToHeaderAndRows(objects, columns)
    header = tinfo.header
    rows = tinfo.rows
  }
  
  if (!rows && !Array.isArray(objects) && columns) {
    rows = objectToRows(objects, columns)
  }

  if (!Array.isArray(rows)) {
    console.warn("SimpleTable can't render", rows)
    return <div style={{color: "red"}}>
      SimpleTable was passed data that it cannot render:
      <pre>{JSON.stringify(rows,null,2)}</pre>
    </div>
  }

  return (
    <table className={className}>
      {
        header &&
        <thead>
          <tr>{header.map(c => <th key={key()}>{c}</th>)}</tr>
        </thead>
      }
      {
        rows &&
        <tbody>
          {rows.map(r => <tr key={key()}>{r.map(c => <td key={key()}>{isValidUrl(c) ? <a href={c} target="_blank">{c}</a> : c}</td>)}</tr>)}
        </tbody>
      }
    </table>

  )
}

const _downloadDocument = async (e, fid) => {
  e.preventDefault();
  FileHelpers.downloadDocuments([fid]);
}

const objectsToTable = (objects, columns) => {
  console.warn("Warning: objectsToTable has been renamed to objectsToHeaderAndRows");
  return objectsToHeaderAndRows(object, columns)
}

const objectToRows = (object, columns) => {
  let rows = [];
  
  columns.forEach((col) => {
    
    let row = [];
    
    row.push(col.name)
    row.push(_.get(object, col.accessor))
    
    rows.push(row);
    
  })
  
  return rows
  
}

const objectsToHeaderAndRows = (objects, columns) => {
  let header = []
  let rows = []
  let first = true
  objects.forEach(o => {
    let row = []
    columns.forEach(c => {
      if (first && c.name) header.push(c.name)
      let value = _.get(o, c.accessor)
      if (c.download) {
        row.push(<a href="#" key={o._id} className="download"
                   onClick={e=>_downloadDocument(e, o)}>{value}</a>)
      }
      else {
        row.push(value)
      }
    })
    rows.push(row)
    first = false
  })
  return { header, rows }
}

export default SimpleTable;

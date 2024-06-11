import React, { useState } from 'react'
import {AlertTable} from'./AlertTable.jsx'
import {AlertTableTestProps} from './testData.js'

export default function ScriptedAlertTable (props) {

  return (
   <>
        {props.data._list.length > 0 ? 
            <AlertTable
                title={AlertTableTestProps.title} 
                columns={AlertTableTestProps.columns} 
                navigateTo={AlertTableTestProps.navigateTo}
                alerts={AlertTableTestProps.alerts}
                scriptName={props.config.scriptName}
            /> : null}
   </>
)
}

export const ScriptedAlertTableFactory = {
  create: ({ config, data, props }) => {
    const newProps = {...config, ...props}
    return <ScriptedAlertTable {...newProps} data={data}/>
  }
}
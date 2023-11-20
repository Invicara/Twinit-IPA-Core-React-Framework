import React, { useState } from 'react'
import AlertTable from './AlertTable'

export default function ScriptedAlertTable (props) {
  const [acknowledgedAlert, setAcknowledgedAlert] = useState(false)

	console.log("ScriptedAlertTable props", props)


  return (
    <AlertTable 
			title={props.config.title} 
			columns={props.config.columns} 
      navigateTo={props.config.navigateTo}
			alerts={props.data._list}
      scriptName={props.config.scriptName}
      setAcknowledgedAlert={setAcknowledgedAlert}
		/>
  )
}

export const ScriptedAlertTableFactory = {
  create: ({ config, data }) => {
    return <ScriptedAlertTable {...config} data={data} />
  }
}

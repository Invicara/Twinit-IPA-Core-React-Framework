import React from 'react'
import AlertTable from './AlertTable'

export default function ScriptedAlertTable (props) {

	console.log("ScriptedAlertTable props", props)


  return (
    <AlertTable 
			title={props.config.title} 
			columns={props.config.columns} 
      navigateTo={props.config.navigateTo}
			alerts={props.data._list}
		/>
  )
}

export const ScriptedAlertTableFactory = {
  create: ({ config, data }) => {
    return <ScriptedAlertTable {...config} data={data} />
  }
}

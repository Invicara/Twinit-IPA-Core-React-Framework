import React from "react"

import './CompactButtonBar.scss'

const CompactButtonBar = (props) => {

  let orientation = props.orientation || "horizontal"

 let barClass = orientation =="horizontal" ? "compact-button-bar horizontal" : "compact-button-bar"
 let btnClass= orientation=="horizontal" ? "compact-button-bar-button horizontal" : "compact-button-bar-button"

    const doAction = (key) => {
      props.dashboard.doAction(props.actions[key])
    }

    let buttons = Object.entries(props.actions).map(([key,a]) =>
      <div key={key} className={btnClass} onClick={e=>doAction(key)}>
        <div className="compact-button-bar-image">
          <img src={"/digitaltwin/" + a.icon}/>
        </div>
        <div className="compact-button-bar-button-text-container">
          <div><h1>{a.title}</h1></div>        
          <div className="compact-button-text">{a.text}</div>
        </div>        
      </div>
    )

    let barStyle = {}    
    return (
      <div className={barClass} style={barStyle}>
        {buttons}
      </div>

    )
}

export default CompactButtonBar

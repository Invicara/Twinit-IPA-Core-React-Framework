import React from "react"

import './BigButtonBar.scss'

const BigButtonBar = (props) => {

  let orientation = props.orientation || "horizontal"

  let barClass = orientation=="horizontal" ? "big-button-bar horizontal" : "big-button-bar"
  let btnClass = orientation=="horizontal" ? "big-button-bar-button horizontal" : "big-button-bar-button"

    const doAction = (key) => {
      props.dashboard.doAction(props.actions[key])
    }

    let buttons = Object.entries(props.actions).map(([key,a]) =>
      <div key={key} className={btnClass}>
        <div>
          <img onClick={e=>doAction(key)} src={"/digitaltwin/" + a.icon}/>
        </div>
        <div onClick={e=>doAction(key)}><h1>{a.title}</h1></div>
        <div>{/* empty div to make grid work */}</div>
        <div onClick={e=>doAction(key)}><span>{a.text}</span></div>
      </div>
    )

    let barStyle = {}
    if (orientation=="horizontal") {
      barStyle = {
          gridTemplateColumns: `repeat(${buttons.length}, ${100/buttons.length}%)`
        }
    }
    return (
      <div className={barClass} style={barStyle}>
        {buttons}
      </div>

    )
}

export default BigButtonBar

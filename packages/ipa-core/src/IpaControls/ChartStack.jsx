import React from "react"

import ScriptedChart from "./ScriptedChart"

const ChartStack = (props) => {

  let i=1;
  return (
    <div
      className="chart-stack"
      style={{
        height: "100%",
        display: "grid",
        gridTemplateColumns: "100%",
        gridTemplateRows: `repeat(${props.charts.length}, ${100/props.charts.length}%)`
      }}>
      {
        props.charts.map(config => <ScriptedChart key={`chart-${i++}`} {...config} />)
      }
    </div>
  )
}

export default ChartStack;

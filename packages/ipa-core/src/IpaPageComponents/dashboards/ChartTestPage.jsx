import React, {useEffect, useState} from "react"
import Select from 'react-select';

import ScriptedChart from "../../IpaControls/ScriptedChart"


const ChartTestPage = ({charts,scripts}) => {

  const [script, setScript] = useState()
  const [chart, setChart] = useState()
  const [newChartConfig, setNewChartConfig] = useState("{}")
  const [chartConfig, setChartConfig] = useState({})

  return (
    <div
      style={{
        display:"grid",
        gridTemplateColumns:"25% 75%",

      }}>
      <div
        style={{
          paddingRight: "20px"
        }}>
        <Select
          placeholder='Select data'
          onChange={o => setScript(o.value)}
          options={scripts.map(s => {return {label: s.title, value: s.name}})}
        />
        <Select
          placeholder='Select chart'
          onChange={o => setChart(o.value)}
          options={charts.map(c => {return {label: c, value: c}})}
        />
        <textarea
          onChange={e=>setNewChartConfig(e.target.value)}
          value={newChartConfig}
          style={{
            margin: "20px 0",
            width: "100%",
            height: "250px"
          }}
          />
        <button
          onClick={e=>setChartConfig(JSON.parse(newChartConfig))}
          style={{
            padding: "5px 10px"
          }}
          >
          Update Chart Config
        </button>
        <br />
        See the following links for available chart configuration:
        <br />
          <a href="https://nivo.rocks/components?filter=SVG" target="_blank">Nivo Chart Documentation</a>
            <br />
          <a href="https://nivo.rocks/components?filter=SVG" target="_blank">Inivcara Chart Extensions</a>

      </div>

      <div
        style={{
          margin: "5px",
          padding: "10px",
          height: "calc(100vh - 175px)",
          minHeight: "300px",
        }}>
        <ScriptedChart script={script} chart={chart} chartConfig={chartConfig}/>
      </div>

    </div>
  )
}

export default ChartTestPage

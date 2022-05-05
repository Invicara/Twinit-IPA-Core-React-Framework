import React, {useEffect, useState} from "react"
import _ from 'lodash'
import {ResponsivePie} from "@nivo/pie"
import {ResponsiveBar} from "@nivo/bar"
import {ResponsiveLine} from "@nivo/line"

import {getChartExtensions} from "./ChartExtensions"

import ScriptHelper from "../IpaUtils/ScriptHelper"

const standard = (dataIn) => {
  return _.entries(dataIn).map(([k,v]) => {
    return {
      id: k, label: k, value: v
    }
  })
}

const line  = (dataIn) => {
  return _.entries(dataIn).map(([k,v]) => {    
    return {
      id: k, data: _.entries(v).map(([x,y]) => {
        return {
           x, y
        }
      })
    }
  })
}

const CHART_GLOBALS = {
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  colors: ["#C71784", "#00A693", "#FF99F1", "#58f5e3", "#83004B"]
}

const CHARTS = {
  "Donut": {component: ResponsivePie, defaultConfig: {innerRadius: 0.75}, translate: standard},
  "Bar": {component: ResponsiveBar, translate: standard},
  "Line": {component: ResponsiveLine, translate: line},
}

const ScriptedChart = ({script, scriptArgs, chart, chartConfig, onClick, scriptedData, style}) => {

  if (!script && !scriptedData || !chart)
    return <div>Select data and chart type...</div>

  const [chartData, setChartData] = useState("fetching")

  useEffect(() => {
    const loadData = async () => {
      setChartData("fetching")
      setChartData(scriptedData || await ScriptHelper.executeScript(script, scriptArgs))
   }    
   loadData()
  }, [script, chart])

  let component = <div>Loading</div>
  let extensions = null

  if (chartData != "fetching") {
    let ci = CHARTS[chart]
    let Chart = ci.component
    
    //the chart data script can return just data, or can return data and other chart settings
    //if other chart data is returned then we get the data from chartData.data
    //and we pass along everything but the data to the chart component as otherData
    //if chartData.data is provided we do not translate the data so it needs to be in the correct form
    let data = !chartData?.data && ci.translate ? ci.translate(chartData) : chartData?.data ? chartData.data : chartData
    let otherData = chartData?.data ? _.omit(chartData, ['data']) : {}
    
    component = <Chart data={data} {...otherData} style={{border: "dashed gray 1px"}} {...CHART_GLOBALS} {...ci.defaultConfig} {...chartConfig} />
    extensions = getChartExtensions(chartConfig, data)
  } 

  return (
    <div className="scripted-chart" style={{position: "relative", ...style}}>
      {extensions}
      {component}
    </div>
  )

}

export const ScriptedChartFactory = {
  create: ({config, data}) => {
    return <ScriptedChart {...config}  scriptedData={data}/>
  }
}

export default ScriptedChart

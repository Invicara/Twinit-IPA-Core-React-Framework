import React from 'react';
import ScriptedChart from "../../IpaControls/ScriptedChart";
import {scriptedData1} from './scriptedChartData'

export default {
  title: 'Controls/ScriptedChart',
  component: ScriptedChart,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
};

const Template = (args) => {
  return <div
      style={{
        minHeight: "300px",
      }}>
    <ScriptedChart style={{'height': 200}} {...args}/>
  </div>
};

export const Line = Template.bind({});
Line.args = {
  //script: 'aaa',
  //scriptArgs: undefined,
  chart: 'Line',
  "chartConfig": {
    data: scriptedData1,
    "colors": [
      "#C52083"
    ],
    width: 900,
    height: 400,
    margin: { top: 20, right: 20, bottom: 60, left: 80 },
    "xScale": {
      "type": "time",
      "format": "%Y",
      "useUTC": false,
      "precision": "year"
    },
    "xFormat": "time:%Y",
    "yScale": {
      "type": "linear",
      "stacked": false
    },
    "axisLeft": {
      "legend": "linear scale",
      "legendOffset": 0
    },
    "axisBottom": {
      "format": "%b %d",
      "tickValues": "every 2 years",
      "legend": "time scale",
      "legendOffset": 0
    },
    "useMesh": true,
    "enableSlices": false,
    "iceTitle": "Capital Expenditure Forecast"
  },
  /*
  chartConfig: {
    xScale: {
      type: 'time',
      format: '%Y-%m-%d',
      useUTC: false,
      precision: 'day',
    },
    xFormat: "time:%Y-%m-%d",
    yScale: {
      type: 'linear',
      stacked: false,
    },
    axisLeft: {
      legend: 'linear scale',
      legendOffset: 12,
    },
    axisBottom: {
      format: '%b %d',
          tickValues: 'every 2 days',
          legend: 'time scale',
          legendOffset: -12,
    },
    curve: 'monotoneX',
    enablePointLabel: true,
    //pointSymbol={CustomSymbol}
    pointSize: 16,
    pointBorderWidth: 1,
    pointBorderColor: {
      from: 'color',
      modifiers: [['darker', 0.3]]
    },
    useMesh: true,
    enableSlices: false,
  },*/
  onClick: _.noop,
  scriptedData: {data: scriptedData1},
  //style:{}
};

---
title: ScriptedChart
sidebar_position: 2150
---
A chart component allowing for chart display based on configuration and scripted data. Can be used on DashboardView, EntityView, and NewNavigatorView. For more detail on the supported charts and configuration specific to chart types see https://nivo.rocks/

### Properties

- `script`: (string) a script to be used to fetch data to be displayed in the chart if not provided in the scriptedData prop
- `scriptedData`: (object | array) data to be used instead of running a script
- `chart`: (string) the chart type to create. Supported values are 'Donut', 'Bar', 'Line', 'TwoAxisLine'
- `chartConfig`: (object) chart specific configuration options. See https://nivo.rocks/ for options for the supported chart types. Also includes any specific chart extensions config as well
- `style`: (object) style options that will be applied to the container created to wrap the chart and any extensions

#### Chart Extensions
Two chart extensions are supported.

- `iceTitle`: (string) a title to be displayed above the chart
- `iceCenterItem`: (string) text to be displayed at the center of the chart - for use with the Donut chart

### Examples
```json
"Asset Performance": {
  "script": "getAssetSensorChartData2",
  "component": {
    "name": "ScriptedChart",
    "style": {
      "height": "250px",
      "marginBottom": "40px"
    },
    "chart": "TwoAxisLine",
    "script": "getAssetSensorChartData2",
    "chartConfig": {
      "line1": {
        "colors": [
          "#7AAABE"
        ],
        "curve": "monotoneX",
        "axisLabel": "Occupancy",
        "axisLabelPosition": "middle",
        "yScale": {
          "type": "linear",
          "min": 0,
          "max": 20
        },
        "enablePoints": false,
        "lineWidth": 4,
        "displayInTooltip": "Occupancy"
      },
      "line2": {
        "colors": [
          "#9B8DC6",
          "#DBCBE8"
        ],
        "curve": "monotoneX",
        "axisLabel": "CO2",
        "axisLabelPosition": "middle",
        "yScale": {
          "type": "linear",
          "min": 0,
          "max": 250
        },
        "enablePoints": false,
        "lineWidth": 4,
        "displayInTooltip": "CO2"
      }
    }
  }
},
```

### Specific Chart Type Configurations

#### TwoAxisLine

When using a TwoAxisLine chart you must provide data and configurations separately per axis.

##### Data

Data passed to the chart must pass the data for each axis separately. Data passed to the chart must be in this form:
```js
let data = {
  line1: [
    {
      "id": "Line 1 Label",
      "data": [
        {
          "x": "2022-08-21",
          "y": 0
        },
        {
          "x": "2022-08-22",
          "y": 2
        }
      ]
    }
  ],
  line2: [
    {
      "id": "Line 2 Label",
      "data": [
        {
          "x": "2022-08-21",
          "y": 10
        },
        {
          "x": "2022-08-22",
          "y": 11
        }
      ]
    }
  ]
}
```

You may pass multiple lines per axis. This can be used to display threshold lines for an axis.
```js
et data = {
  line1: [
    {
      "id": "Line 1 id",
      "data": [
        {
          "x": "2022-08-21",
          "y": 0
        },
        {
          "x": "2022-08-22",
          "y": 2
        }
      ]
    }
  ],
  line2: [
    {
      "id": "Line 2 id",
      "data": [
        {
          "x": "2022-08-21",
          "y": 6
        },
        {
          "x": "2022-08-22",
          "y": 11
        }
      ]
    },
    {
      "id": "Line 2 Threshold id",
      "data": [
        {
          "x": "2022-08-21",
          "y": 8
        },
        {
          "x": "2022-08-22",
          "y": 8
        }
      ]
    }
  ]
}
```

##### Specific Configuration

The chart config must also provide configuration at the axis level. THis allows for you to set different colors per axis and specify other details like which line should appear in the tooltip.

Config Properties

- `axisLabel`: (string) the text you wish to show on the axis
- `axisLabelPosition`: (string) the position on the axis you would like the label to appear at
- `displayInTooltip`: (string) the id from the line data to use in the tooltip.

Example

```json
"chartConfig": {
  "line1": {
    "axisLabel": "Occupancy",
    "axisLabelPosition": "middle",
    "displayInTooltip": "Occupancy"
  },
  "line2": {
    "axisLabel": "CO2",
    "axisLabelPosition": "middle",
    "displayInTooltip": "CO2"
  }
},
```
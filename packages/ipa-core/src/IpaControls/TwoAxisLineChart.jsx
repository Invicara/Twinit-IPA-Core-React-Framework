import React, {useEffect, useState} from "react"


import {ResponsiveLine} from "@nivo/line"



const getColoredAxis = (color) => {
  return {
    // making the background transparent
    background: "rgba(255, 255, 255, 0)",
    axis: {
      ticks: {
        line: {
          stroke: color
        },
        text: { fill: color }
      },
      legend: {
        text: {
          fill: color
        }
      }
    }
  }
}

const TwoAxisLineChart = ({data, line1, line2}) => {

  console.log(data, line1, line2)

  const [graphContainerStyle, setGraphContainerStyle] = useState({})

  useEffect(() => {

    /* 
     * this is dumb but we have to do it this way as far as I can tell
     * if we simply apply these styles on graphContainer from the start the charts
     * do not correctly overlay each other. One chart will always be slightly
     * wider than the other. However if we let the two charts render, then update
     * the styles when the data prop udpates, the two charts line up nicely
    */

    setGraphContainerStyle({position: 'absolute', width: '100%'})
  }, [data])

  const SecondGraph = () => {

    let line1DataForTooltip = data.line1.filter(d => d.id === line1.displayInTooltip)
    let line2DataForTooltip = data.line2.filter(d => d.id === line2.displayInTooltip)

    return (
      <ResponsiveLine
        {...line2}
        data={data.line2}
        margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
        axisRight={{
          legend: line2.axisLabel,
          legendPosition: line2.axisLabelPosition,
          legendOffset: 40
        }}
        axisLeft={null}
        axisTop={null}
        enableGridY={false}
        axisBottom={null}
        theme={getColoredAxis(line2.colors[0])}
        /* Add this for tooltip */
        useMesh={true}
        enableSlices="x"
        sliceTooltip={({ slice }) => {
          let slicePoints = slice.points.filter((sp) => {
            return sp.serieId === line1.displayInTooltip || sp.serieId === line2.displayInTooltip
          })
          return (
            <div
              style={{
                background: "white",
                padding: "9px 12px",
                border: "1px solid #ccc"
              }}
            >
              {/* making the tooltip recognise both data points */}
              <div>"{slicePoints[0].data.x}"</div>
              {slicePoints.map((point) => (
                <div key={point.id}>
                  <div
                    style={{
                      color: line1.colors[0],
                      padding: "3px 0"
                    }}
                  >
                    <strong>{line1DataForTooltip[0].id}</strong> [{line1DataForTooltip[0].data[point.index].y}]
                  </div>
                  <div
                    style={{
                      color: line2.colors[0],
                      padding: "3px 0"
                    }}
                  >
                    <strong>{line2DataForTooltip[0].id}</strong> [{line2DataForTooltip[0].data[point.index].y}
                    ]
                  </div>
                </div>
              ))}
            </div>
          );
        }}
      />
    )
  }

  return (

      <div className="wrapper">
        <div className="graphContainer" style={graphContainerStyle}>
          <ResponsiveLine
            {...line1}
            data={data.line1}
            layers={["grid", "markers", "axes", "lines", "legends"]}
            axisLeft={{
              legend: line1.axisLabel,
              legendPosition: line1.axisLabelPosition,
              legendOffset: -40
            }}
            yScale={{
              type: line1.yScale.type,
              min: line1.yScale.min,
              max: line1.yScale.max
            }}
            theme={getColoredAxis(line1.colors[0])}
            margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
          />
        </div>

        <div className="secondGraph">
          <SecondGraph />
        </div>
      </div>
  )
}

export default TwoAxisLineChart

import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import { Pie } from "@nivo/pie";
import { Bar } from "@nivo/bar";
import { Line } from "@nivo/line";
import TwoAxisLineChart from "./TwoAxisLineChart";

import { getChartExtensions } from "./ChartExtensions";

import ScriptHelper from "../IpaUtils/ScriptHelper";

const standard = (dataIn) => {
  return _.entries(dataIn).map(([k, v]) => {
    return {
      id: k,
      label: k,
      value: v,
    };
  });
};

const line = (dataIn) => {
  return _.entries(dataIn).map(([k, v]) => {
    return {
      id: k,
      data: _.entries(v).map(([x, y]) => {
        return {
          x,
          y,
        };
      }),
    };
  });
};

const CHART_GLOBALS = {
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  colors: ["#C71784", "#00A693", "#FF99F1", "#58f5e3", "#83004B"],
};

// Use non-Responsive variants — ResponsivePie/Bar/Line wrap nivo's ResponsiveWrapper
// which uses react-virtualized-auto-sizer via CJS require(), returning the module
// object instead of the component (ESM default-export interop issue), causing
// React error #130 in webpack builds.
const CHARTS = {
  Donut: {
    component: Pie,
    defaultConfig: { innerRadius: 0.75 },
    translate: standard,
  },
  Bar: { component: Bar, translate: standard },
  Line: { component: Line, translate: line },
  TwoAxisLine: { component: TwoAxisLineChart },
};

const ScriptedChart = ({
  script,
  scriptArgs,
  chart,
  chartConfig,
  onClick,
  scriptedData,
  style,
}) => {
  const [chartData, setChartData] = useState("fetching");
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if ((!script && !scriptedData) || !chart) return;
    const loadData = async () => {
      setChartData("fetching");
      setChartData(
        (await ScriptHelper.executeScript(script, scriptArgs)) || scriptedData,
      );
    };
    loadData();
  }, [script, chart]);

  if ((!script && !scriptedData) || !chart)
    return <div>Select data and chart type...</div>;

  let component = <div>Loading</div>;
  let extensions = null;

  const { width, height } = containerSize;

  if (chartData !== "fetching") {
    const ci = CHARTS[chart];
    if (!ci) {
      component = <div>Unknown chart type: {chart}</div>;
    } else {
      const Chart = ci.component;
      const safeChartConfig = chartConfig || {};
      //the chart data script can return just data, or can return data and other chart settings
      //if other chart data is returned then we get the data from chartData.data
      //and we pass along everything but the data to the chart component as otherData
      //if chartData.data is provided we do not translate the data so it needs to be in the correct form
      let data =
        !chartData?.data && ci.translate
          ? ci.translate(chartData)
          : chartData?.data
            ? chartData.data
            : chartData;
      let otherData = chartData?.data ? _.omit(chartData, ["data"]) : {};
      // strip ice* extension keys so they don't get passed to nivo as props
      const nivoConfig = _.omitBy(safeChartConfig, (v, k) => k.startsWith("ice"));
      if (width > 0 && height > 0) {
        component = (
          <Chart
            data={data}
            width={width}
            height={height}
            {...otherData}
            {...CHART_GLOBALS}
            {...ci.defaultConfig}
            {...nivoConfig}
          />
        );
      }
      extensions = getChartExtensions(safeChartConfig, data);
    }
  }

  return (
    <div className="scripted-chart" style={{ position: "relative", height: "100%", ...style }}>
      {extensions}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
        {component}
      </div>
    </div>
  );
};

export const ScriptedChartFactory = {
  create: ({ config, data }) => {
    return <ScriptedChart {...config} scriptedData={data} />;
  },
};

export default ScriptedChart;

import React from "react";
import { getRandomString } from "../IpaUtils/helpers";

const getPercent = (datum, data) => {
  let total = data.reduce((tot, d) => (tot += d.value), 0);
  return Math.round(100 * (datum.value / total));
};

const addTitle = (title) => (
  <h1
    key={getRandomString("ice-title-")}
    style={{ position: "absolute", width: "100%", textAlign: "center" }}
  >
    {title}
  </h1>
);

const addCenterLabel = (config, data) => {
  let datum = data.find((d) => d.id == config.id);
  let label = config.label;
  let value = datum ? getPercent(datum, data) + "%" : "N/A";
  return (
    <div
      key={getRandomString("ice-center-label-")}
      style={{ position: "absolute", width: "100%", height: "100%" }}
    >
      <div
        style={{
          position: "absolute",
          textAlign: config.textAlign || "center",
          height: "40%",
          width: "100%",
          top: "36%",
          ...(config.extraStyle || {}),
        }}
      >
        <div
          style={{
            fontSize: config.valueFontSize || "50px",
            lineHeight: 1,
            ...(config.extraValueStyle || {}),
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: config.labelFontSize || "16px",
            ...(config.extraLabelStyle || {}),
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

const EXTENSIONS = {
  iceTitle: addTitle,
  iceCenterItem: addCenterLabel,
};

const getChartExtensions = (chartConfig, data) => {
  let exConfigKeys = Object.keys(chartConfig).filter((k) =>
    k.startsWith("ice"),
  );
  let extensions = exConfigKeys.map((x) => EXTENSIONS[x](chartConfig[x], data));
  return extensions;
};

export { getChartExtensions };

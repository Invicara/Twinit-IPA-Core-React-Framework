import React from "react";
import ScriptedChart from "../../IpaControls/ScriptedChart";
import { configLine, configDonut, configBar } from "./scriptedChartConfigs";

export default {
  title: "Controls/ScriptedChart",
  component: ScriptedChart,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
  argTypes: {
    onHover: { action: "onHover" },
    onFocus: { action: "onFocus" },
  },
};

const Template = (args) => {
  return (
    <div
      style={{
        minHeight: "300px",
      }}
    >
      <ScriptedChart style={{ height: 350 }} {...args} />
    </div>
  );
};

export const Line = Template.bind({});
export const Donut = Template.bind({});
export const Bar = Template.bind({});

Line.args = {
  ...configLine,
};

Donut.args = {
  ...configDonut,
};

Bar.args = {
  ...configBar,
};

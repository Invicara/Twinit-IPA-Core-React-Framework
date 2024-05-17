import TwoAxisLineChart from "../../IpaControls/TwoAxisLineChart";

export default {
  title: "Controls/TwoAxisLineChart",
  component: TwoAxisLineChart,
  argTypes: {
    onClick: { action: "onClick" },
    onFetch: { action: "onFetch" },
  },
};

const Template = (args) => {
  return <TwoAxisLineChart {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  data: {
    line1: [
      {
        id: "line1",
        data: [
          { x: "A", y: 10 },
          { x: "B", y: 20 },
          { x: "C", y: 30 },
        ],
      },
      // Add more data points for line1 as needed
    ],
    line2: [
      {
        id: "line2",
        data: [
          { x: "A", y: 15 },
          { x: "B", y: 25 },
          { x: "C", y: 35 },
        ],
      },
      // Add more data points for line2 as needed
    ],
  },
  line1: {
    colors: ["#ff0000"], // Line 1 color
    axisLabel: "Line 1 Axis Label",
    axisLabelPosition: "bottom",
    yScale: { type: "linear", min: 0, max: 40 }, // Line 1 y-axis scale
    displayInTooltip: "line1", // Specify which line's data to display in the tooltip
    // Add more configuration options for line1 as needed
  },
  line2: {
    colors: ["#00ff00"], // Line 2 color
    axisLabel: "Line 2 Axis Label",
    axisLabelPosition: "bottom",
    yScale: { type: "linear", min: 0, max: 40 }, // Line 2 y-axis scale
    displayInTooltip: "line2", // Specify which line's data to display in the tooltip
    // Add more configuration options for line2 as needed
  },
  style: { height: 400 }, // Height of the chart
};

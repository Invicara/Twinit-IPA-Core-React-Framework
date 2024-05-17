import React from "react";
import SimpleTabbedTable from "../../IpaControls/SimpleTabbedTable";

export default {
  title: "Controls/SimpleTabbedTable",
  component: SimpleTabbedTable,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
};

const Template = (args) => {
  return (
    <SimpleTabbedTable
      className="simple-property-grid simple-property-grid-header"
      {...args}
    />
  );
};

export const Default = Template.bind({});

Default.args = {
  data: {
    1: { val: "Spain" },
    2: { val: "Italy" },
    3: { val: "France" },
    4: { val: "Africa" },
    5: { val: "Europe" },
    6: { val: "Pacific" },
    7: { val: "Atlantic" },
    8: { val: "Indian" },
    9: { val: "Arctic" },
  },
  tabs: {
    Countries: ["1", "2", "3"],
    Continents: ["4", "5"],
    Oceans: ["6", "7", "8", "9"],
  },
  className: "custom-class",
};

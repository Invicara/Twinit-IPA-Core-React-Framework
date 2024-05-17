import React from "react";

import BigButtonBar from "../IpaControls/BigButtonBar";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Controls/BigButtonBar",
  component: BigButtonBar,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    orientation: "horizontal",
    actions: { one: {} },
    onClick: { action: "onClick" },
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <BigButtonBar {...args} />;

export const Horizontal = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Horizontal.args = {
  actions: { one: { title: "Horizontal", text: "", icon: "icon-user.svg" } },
  orientation: "horizontal",
};

export const Vertical = Template.bind({});
Vertical.args = {
  actions: {
    one: { title: "Vertical", text: "Content", icon: "icon-nav-purple.svg" },
  },
  orientation: "vertical",
};

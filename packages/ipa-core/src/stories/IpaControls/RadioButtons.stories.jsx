import React from "react";
import RadioButtons from "../../IpaControls/RadioButtons";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Controls/RadioButtons",
  component: RadioButtons,
  argTypes: { onChange: { action: "onChange" } },
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();
  const handleChange = (e, f) => {
    // updage args value with useArgs()
    updateArgs({ ...args, value: e.target.value });
  };

  return (
    <div onClick={handleChange}>
      <RadioButtons {...args} />
    </div>
  );
};

export const Default = Template.bind({});

Default.args = {
  value: "Apple",
  options: ["Apple", "Banana", "Pear"],
};

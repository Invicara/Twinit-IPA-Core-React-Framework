import SplitButton from "../../IpaControls/SplitButton";

export default {
  title: "Controls/SplitButton",
  component: SplitButton,
  argTypes: {
    onClick: { action: "onClick" },
    onOptionChange: { action: "onOptionChange" },
  },
};

const Template = (args) => {
  return <SplitButton {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  options: ["Option 1", "Option 2", "Option 3", "Option 4"],
  airaLabel: "Select an option",
};

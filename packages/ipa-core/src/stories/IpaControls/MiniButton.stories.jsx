import MiniButton from "../../IpaControls/MiniButton";

export default {
  title: "Controls/MiniButton",
  component: MiniButton,
  argTypes: { onClick: { action: "onClick" } },
};

const Template = (args) => {
  return <MiniButton {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  value: "Submit",
};

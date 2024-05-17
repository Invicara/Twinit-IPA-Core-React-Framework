import GenericMatButton from "../../IpaControls/GenericMatButton";

export default {
  title: "Controls/GenericMatButton",
  component: GenericMatButton,
  argTypes: { onClick: { action: "onClick" } },
};

const Template = (args) => {
  return <GenericMatButton {...args} />;
};

export const Default = Template.bind({});
export const Small = Template.bind({});
export const Medium = Template.bind({});
export const Large = Template.bind({});
export const Disabled = Template.bind({});

Default.args = {
  children: "Submit",
};

Small.args = {
  children: "Small",
  size: "small",
};

Medium.args = {
  children: "Medium",
  size: "medium",
};

Large.args = {
  children: "Large",
  size: "large",
};

Disabled.args = {
  children: "Disabled",
  size: "medium",
  disabled: "true",
};

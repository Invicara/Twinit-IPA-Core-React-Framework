import AlertIndicator from "../../IpaControls/AlertIndicator";

export default {
  title: "Controls/AlertIndicator",
  component: AlertIndicator,
};

const Template = (args) => {
  return <AlertIndicator {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  className: "",
  descriptions: ["Warning", "Something's wrong"],
};

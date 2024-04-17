import GenericButton from "../../IpaControls/GenericButton";

export default {
  title: "Controls/GenericButton",
  component: GenericButton,
  argTypes: { onClick: { action: "onClick" } },
};

const Template = (args) => {
  return <GenericButton {...args} />;
};

export const Default = Template.bind({});
export const CustomStyle = Template.bind({});

Default.args = {
  text: "Submit",
};

CustomStyle.args = {
  text: "Custom Button",
  styles: {
    backgroundColor: "green",
    color: "white",
    borderColor: "white",
  },
};

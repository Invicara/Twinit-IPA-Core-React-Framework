import ControlTextOverlay from "../../IpaControls/ControlTextOverlay"; // Adjust the path accordingly

export default {
  title: "Controls/ControlTextOverlay",
  component: ControlTextOverlay,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
};

const Template = (args) => {
  return <ControlTextOverlay {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  style: {},
  text: "Hi there",
  className: "",
  required: false,
};

import GenericIframe from "../../IpaControls/GenericIframe";

export default {
  title: "Controls/GenericIframe",
  component: GenericIframe,
};

const Template = (args) => {
  return <GenericIframe {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  url: "https://example.com",
  allowFullscreen: false,
  width: "600px",
  height: "300px",
};

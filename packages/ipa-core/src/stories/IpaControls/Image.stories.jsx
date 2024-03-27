import Image from "../../IpaControls/Image";

export default {
  title: "Controls/Image",
  component: Image,
  argTypes: {
    dashboard: {
      doAction: { action: "action" },
    },
  },
};

const Template = (args) => {
  return <Image {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  script: "your_script_here",
  url: "/digitaltwin/icons/icon-assets-purple.svg",
  filename: "example.jpg",
  styles: { maxWidth: "200px", maxHeight: "200px" },
  navigateTo: "dashboard",
  query: {},
  dashboard: {
    doAction: (action) => {
      console.log("Action triggered:", action);
    },
  },
  padding: "10px",
};

import BottomPanel from "../../IpaLayouts/BottomPanel";

export default {
  title: "Layouts/BottomPanel",
  component: BottomPanel,
  parameters: {
    backgrounds: { default: "light" },
  },
  argTypes: {},
};

const Template = (args) => {
  return <BottomPanel {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  height: "250px",
  hideOnLoad: false,
  children: "Hello",
};

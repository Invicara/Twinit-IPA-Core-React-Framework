import FlexLeftNavs from "../../IpaLayouts/FlexLeftNavs";

export default {
  title: "Layouts/FlexLeftNavs",
  component: FlexLeftNavs,
  parameters: {
    backgrounds: { default: "light" },
  },
  argTypes: {},
};

const Template = (args) => {
  return <FlexLeftNavs {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  height: "250px",
  children: <div></div>,
};

import FlexContainer from "../../IpaLayouts/FlexContainer";

export default {
  title: "Layouts/FlexContainer",
  component: FlexContainer,
  parameters: {
    backgrounds: { default: "light" },
  },
  argTypes: {},
};

const Template = (args) => {
  return <FlexContainer {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  height: "250px",
  hideOnLoad: false,
  children: "Hello",
};

import SimpleTextThrobber from "../../IpaControls/SimpleTextThrobber";

export default {
  title: "Controls/SimpleTextThrobber",
  component: SimpleTextThrobber,
};

const Template = (args) => {
  return <SimpleTextThrobber {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  throbberText: "Lorem ipsum dolor sit amet",
};

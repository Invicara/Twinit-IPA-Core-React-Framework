import SimpleTextReducer from "../../IpaControls/SimpleTextReducer";

export default {
  title: "Controls/SimpleTextReducer",
  component: SimpleTextReducer,
};

const Template = (args) => {
  return <SimpleTextReducer {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  limit: 20,
};

import { FetchButton } from "../../IpaControls/FetchButton";

export default {
  title: "Controls/FetchButton",
  component: FetchButton,
  argTypes: { onClick: { action: "onClick" } },
};

const Template = (args) => {
  return <FetchButton {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  children: "Fetch",
};

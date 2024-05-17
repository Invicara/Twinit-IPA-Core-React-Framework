import { MiniIconButton } from "../../IpaControls/MiniButton";

export default {
  title: "Controls/MiniIconButton",
  component: MiniIconButton,
  argTypes: { onClick: { action: "onClick" } },
};

const Template = (args) => {
  return <MiniIconButton {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  icon: "fa fa-picture-o",
};

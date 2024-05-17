import ActionButton from "../../IpaControls/ActionButton";

export default {
  title: "Controls/ActionButtonToolTip",
  component: ActionButton,
  parameters: {
    backgrounds: { default: "dark" },
  },
  argTypes: { onClick: { action: "onClick" } },
};

const Template = (args) => {
  return <ActionButton {...args} />;
};

export const WithTitleAndIcon = Template.bind({});

WithTitleAndIcon.args = {
  title: "Action Button Tooltip",
  icon: "fa fa-info",
};

import LinkedIcon from "../../IpaControls/LinkedIcon";

export default {
  title: "Controls/LinkedIcon",
  component: LinkedIcon,
  argTypes: { onClick: { action: "clicked" } },
};

const Template = (args) => {
  return <LinkedIcon {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  customClass: "linked-icon-container",
  clickHandler: () => {},
  icon: "fas fa-star",
  iconImg: "/digitaltwin/icons/icon-assets-purple.svg",
  iconClasses: "icon-image",
  linkText: "Click me!",
};

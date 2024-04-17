import { PopoverMenuView } from "../../IpaLayouts/PopoverMenuView";

export default {
  title: "Layouts/PopoverMenuView",
  component: PopoverMenuView,
  argTypes: { onClick: { action: "onClick" } },
};

const Template = (args) => {
  return <PopoverMenuView {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  actions: [
    {
      title: "Action 1",
      onClick: () => console.log("Action 1 clicked"),
    },
    {
      title: "Action 2",
      onClick: () => console.log("Action 2 clicked"),
    },
    {
      title: "Action 3",
      onClick: () => console.log("Action 3 clicked"),
    },
  ],
};

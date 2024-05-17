import GroupControl from "../../IpaControls/GroupControl";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Controls/GroupControl",
  component: GroupControl,
  argTypes: { onChange: { action: "onChange" } },
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();
  const handleClick = (e, f) => {
    updateArgs({ ...args, selected: e.target.value });
  };
  return (
    <div onClick={handleClick}>
      <GroupControl {...args} />
    </div>
  );
};

export const Default = Template.bind({});

Default.args = {
  groups: ["Group 1", "Group 2", "Group 3"],
  selected: ["Group 1"],
};

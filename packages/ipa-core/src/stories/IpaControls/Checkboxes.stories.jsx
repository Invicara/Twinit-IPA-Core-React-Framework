import { PinkCheckbox } from "../../IpaControls/Checkboxes"; // Adjust the path accordingly
import { useArgs } from "@storybook/client-api";

export default {
  title: "Controls/Checkbox",
  component: PinkCheckbox,
  argTypes: {
    checked: {
      control: "boolean",
    },
    onChange: {
      action: "changed",
    },
  },
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();

  const handleClick = (e, f) => {
    updateArgs({
      ...args,
      checked: !args.checked,
    });
  };

  return (
    <div onClick={handleClick}>
      <PinkCheckbox {...args} />
    </div>
  );
};

export const Checked = Template.bind({});

Checked.args = {
  checked: true, // Whether the checkbox is checked or not
  onChange: () => {},
};

export const Unchecked = Template.bind({});

Unchecked.args = {
  checked: false, // Whether the checkbox is checked or not
  onChange: () => {},
};

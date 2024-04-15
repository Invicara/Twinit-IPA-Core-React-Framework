import CollapsibleTextInput from "../../IpaControls/CollapsibleTextInput";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Controls/CollapsibleTextInput",
  component: CollapsibleTextInput,
  argTypes: {
    labelProps: { control: "object" },
    inputProps: { control: "object" },
    onChange: { action: "onChange" },
    onFocusChange: { action: "onFocusChange" },
  },
};

const Template = (args) => {
  const handleChange = (e) => {
    updateArgs({
      ...args,
      inputProps: {
        ...args.inputProps,
        value: e.target.value,
        collapsedText: e.target.value.substring(0, 20) + "...",
      },
    });
  };
  return (
    <div>
      <CollapsibleTextInput {...args} onChange={handleChange} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  labelProps: {
    text: "Description",
    className: "custom-label",
    collapsedText: "Click to expand",
  },
  inputProps: {
    value:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    collapsedText:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed...",
    onFocusChange: (isFocused) => {
      console.log("Focused:", isFocused);
    },
  },
};

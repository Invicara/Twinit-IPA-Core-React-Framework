import CollapsibleTextInput from "../../IpaControls/CollapsibleTextInput";

export default {
  title: "Controls/CollapsibleTextInput",
  component: CollapsibleTextInput,
  parameters: {
    backgrounds: { default: "light" },
  },
  argTypes: {
    onChange: {
      action: "changed",
    },
  },
};

const Template = (args) => {
  return (
    <div style={{ maxWidth: "200px" }}>
      <CollapsibleTextInput {...args} />
    </div>
  );
};

export const Default = Template.bind({});

Default.args = {
  inputProps: {
    value: "This is the collapsed text", // Initial value when collapsed
    collapsedText: "This is the...", // Text to show when collapsed
    onChange: (e, isFocused) => {
      const [_, updateArgs] = useArgs();
      updateArgs({
        ...args,
        inputProps: {
          ...args.inputProps,
          value: e.target.value,
        },
      });
    },
  },
  labelProps: {
    text: "Input Label", // Label text
    className: "custom-label-class", // Custom class for label
  },
};

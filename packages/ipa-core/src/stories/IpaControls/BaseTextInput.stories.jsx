import BaseTextInput from "../../IpaControls/BaseTextInput";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Controls/BaseTextInput",
  component: BaseTextInput,
  parameters: {
    backgrounds: { default: "light" },
  },
  argTypes: {},
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();

  const handleChange = (e, f) => {
    updateArgs({
      ...args,
      inputProps: {
        ...args.inputProps,
        value: e.target.value,
      },
    });
  };
  return (
    <div onChange={handleChange} style={{ maxWidth: "200px" }}>
      <BaseTextInput {...args} />
    </div>
  );
};

export const Unrequired = Template.bind({});
export const Required = Template.bind({});

Unrequired.args = {
  className: "",
  labelProps: {
    styles: {},
    text: "Address",
    className: "",
    required: false,
  },
  inputProps: {
    type: "text",
    value: "",
    styles: {},
    placeholder: "",
    disabled: false,
  },
};

Required.args = {
  className: "",
  labelProps: {
    styles: {},
    text: "Surname",
    className: "",
    required: true,
  },
  inputProps: {
    type: "text",
    value: "",
    styles: {},
    placeholder: "",
    disabled: false,
  },
};

import Select from "../../IpaControls/Select";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Controls/Select",
  component: Select,
  argTypes: { onChange: { action: "onChange" } },
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();

  const handleChange = (e, f) => {
    updateArgs({ ...args, value: e.target.value });
  };

  return (
    <div onClick={handleChange} style={{ width: "400px" }}>
      <Select {...args} />
    </div>
  );
};

export const Default = Template.bind({});
export const MultiSelect = Template.bind({});

Default.args = {
  isMulti: false,
  labelProps: {
    style: {},
    text: "",
    label: "Select",
    required: false,
  },
  value: {},
  options: [
    { id: 0, label: "Toyota", value: "Toyota" },
    { id: 1, label: "Nissan", value: "Nissan" },
    { id: 2, label: "BMW", value: "BMW" },
    { id: 3, label: "Mazda", value: "Mazda" },
  ],
  placeholder: "Choose options",
  label: "Select",
  isDisabled: false,
  menuPlacement: "top",
  menuPosition: "left",
  styles: {},
};

MultiSelect.args = {
  isMulti: true,
  labelProps: {
    style: {},
    text: "",
    label: "Select",
    required: false,
  },
  value: {},
  options: [
    { id: 0, label: "Toyota", value: "Toyota" },
    { id: 1, label: "Nissan", value: "Nissan" },
    { id: 2, label: "BMW", value: "BMW" },
    { id: 3, label: "Mazda", value: "Mazda" },
  ],
  placeholder: "Choose options",
  label: "Select",
  isDisabled: false,
  menuPlacement: "top",
  menuPosition: "left",
  styles: {},
};

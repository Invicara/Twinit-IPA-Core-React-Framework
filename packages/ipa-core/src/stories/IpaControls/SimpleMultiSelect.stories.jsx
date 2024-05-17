import SimpleMultiSelect from "../../IpaControls/SimpleMultiSelect";
import Select from "../../IpaControls/SimpleMultiSelect";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Controls/SimpleMultiSelect",
  component: SimpleMultiSelect,
  argTypes: { onClick: { action: "onClick" } },
};

const Template = (args) => {
  const [props, updateArgs] = useArgs();

  const handleChange = (e, f) => {
    if (e.target.innerHTML[0] !== "<") {
      const updateSelections = props.selections.filter(
        (selection) => selection != e.target.innerHTML,
      );
      updateArgs({ ...args, selections: updateSelections });
    } else {
      e.target.value !== "Choose another value..." &&
      e.target.value !== "Choose a value..."
        ? props.selections.push(e.target.value)
        : null;

      updateArgs({ ...args, selections: props.selections });
    }
  };

  return (
    <div onClick={handleChange} style={{ width: "200px" }}>
      <SimpleMultiSelect {...args} />
    </div>
  );
};

export const Default = Template.bind({});

Default.args = {
  propName: "",
  available: ["Blue", "Red", "Green", "Purple", "Orange"],
  selections: [],
  update: (e) => {},
};

import { DynamicAttributeInput } from "../../IpaControls/DynamicAttributeInput";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Controls/DynamicAttributeInput",
  component: DynamicAttributeInput,
  argTypes: { onChange: { action: "onClick" } },
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();

  const handleChange = (e, f) => {
    updateArgs({
      ...args,
      value: e.target.value,
    });
  };

  const handleClick = (e, f) => {
    if (e.target.innerHTML.length) {
      updateArgs({
        ...args,
        value: e.target.innerHTML,
      });
    }
  };

  return (
    <div onClick={handleClick} onChange={handleChange}>
      <DynamicAttributeInput {...args} />
    </div>
  );
};

export const Default = Template.bind({});

const mockDynamicValues = [
  "Apple",
  "Banana",
  "Orange",
  "Mango",
  "Pineapple",
  "Grapes",
  "Strawberry",
  "Blueberry",
  "Watermelon",
  "Kiwi",
];

const fetchValuesOnFocusMock = async () => {
  // Simulating an asynchronous API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Returning mock dynamic values
      resolve(mockDynamicValues);
    }, 1000); // Simulating a delay of 1 second
  });
};

Default.args = {
  attribute: "attribute_name", // Define the attribute name
  value: "", // Define the input value
  fetchValuesOnFocus: fetchValuesOnFocusMock,
  isDisabled: false, // Define whether the input is disabled or not
  onBlur: () => {},
  themeOptions: {},
};

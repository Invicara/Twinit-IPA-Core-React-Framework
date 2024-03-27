import { DynamicAttributeInput } from "../../IpaControls/DynamicAttributeInput";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Controls/DynamicAttributeInput",
  component: DynamicAttributeInput,
  argTypes: { onClick: { action: "onClick" } },
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();

  const handleChange = (e, f) => {
    updateArgs({
      ...args,
      value: e.target.value,
    });
  };

  return (
    <div onChange={handleChange}>
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
  onChange: (attribute, newValue) => {},
  fetchValuesOnFocus: fetchValuesOnFocusMock,
  isDisabled: false, // Define whether the input is disabled or not
  onBlur: () => {
    // Define onBlur logic if needed
  },
  themeOptions: {
    // Define theme options if needed
  },
};

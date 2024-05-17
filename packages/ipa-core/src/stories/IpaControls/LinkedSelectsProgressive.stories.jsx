import LinkedSelectsProgressive from "../../IpaControls/LinkedSelectsProgressive";

export default {
  title: "Controls/LinkedSelectsProgressive",
  component: LinkedSelectsProgressive,
  argTypes: {
    attributes: { control: "object" },
    options: { control: "object" },
    onChange: { action: "onChange" }, // Define action for onChange event
  },
};

const Template = (args) => <LinkedSelectsProgressive {...args} />;

export const Default = Template.bind({});
Default.args = {
  attributes: [
    {
      name: "Color",
      isMulti: false,
      values: ["Red", "Green", "Blue"],
      placeholder: "Select Color",
    },
    {
      name: "Sizes",
      isMulti: true,
      values: ["Small", "Medium", "Large"],
      placeholder: "Select Size(s)",
    },
  ],
  options: {
    direction: "horizontal", // Set direction to 'horizontal'
    hasLabel: true,
    isRequired: true,
  },
  onChange: (values) => console.log("Selected Values:", values), // Log selected values to console
};

// Additional story to demonstrate component behavior with different props
export const VerticalLayout = Template.bind({});
VerticalLayout.args = {
  attributes: [
    {
      name: "Category",
      isMulti: false,
      values: ["Electronics", "Clothing", "Books"],
      placeholder: "Select Category",
    },
    {
      name: "Brand",
      isMulti: true,
      values: ["Apple", "Nike", "Amazon"],
      placeholder: "Select Brand(s)",
    },
    {
      name: "Price Range",
      isMulti: false,
      values: ["Low", "Medium", "High"],
      placeholder: "Select Price Range",
    },
  ],
  options: {
    direction: "vertical", // Set direction to 'vertical'
    hasLabel: false,
    isRequired: false,
  },
  onChange: (values) => console.log("Selected Values:", values), // Log selected values to console
};

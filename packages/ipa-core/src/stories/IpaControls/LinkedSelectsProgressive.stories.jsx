import LinkedSelectsProgressive from "../../IpaControls/LinkedSelectsProgressive";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Controls/LinkedSelectsProgressive",
  component: LinkedSelectsProgressive,
  argTypes: { onChange: { action: "changed" } },
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();
  const handleClick = (e, f) => {
    updateArgs({ ...args, defaultSelections: e.target.value });
  };
  return (
    <div onClick={handleClick}>
      <LinkedSelectsProgressive {...args} />
    </div>
  );
};

export const Default = Template.bind({});

Default.args = {
  attributes: [
    {
      name: "Category",
      isMulti: false,
      values: ["Electronics", "Clothing", "Books"],
      placeholder: "Select category",
    },
    {
      name: "Subcategory",
      isMulti: true,
      values: ["Smartphones", "Laptops"],
      placeholder: "Select subcategory",
    },
  ],
  onChange: (selectedValues) => {
    console.log("Selected values:", selectedValues);
  },
  options: {
    direction: "vertical",
    hasLabel: true,
    isRequired: true,
  },
  defaultSelections: {
    Category: "Electronics",
    Subcategory: ["Smartphones", "Laptops"],
  },
  btn: <button>Submit</button>,
  disabled: false,
};

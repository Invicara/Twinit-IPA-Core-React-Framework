import HierarchyAttributeSelects from "../../IpaControls/HierarchyAttributeSelects";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Controls/HierarchyAttributeSelects",
  component: HierarchyAttributeSelects,
  argTypes: { onChange: { action: "onChange" } },
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();
  const handleClick = (e, f) => {
    updateArgs({ ...args, selected: e.target.value });
  };

  return (
    <div onClick={handleClick}>
      <HierarchyAttributeSelects {...args} />
    </div>
  );
};

export const Default = Template.bind({});

Default.args = {
  attributeValues: {
    Country: {
      USA: {
        State: {
          California: ["Los Angeles", "San Francisco"],
          Texas: ["Houston", "Austin"],
        },
      },
      Canada: {
        Province: {
          Ontario: ["Toronto", "Ottawa"],
          Quebec: ["Montreal", "Quebec City"],
        },
      },
    },
  },
  hierarchyAttributes: ["Country", "State", "City"],
  defaultSelections: {
    Country: "USA",
    State: "California",
    City: "Los Angeles",
  },
  isMulti: true,
  disabled: false,
  btn: null,
};

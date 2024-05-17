import React from "react";
import HierarchyAttributeSelects from "../../IpaControls/HierarchyAttributeSelects";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Controls/HierarchyAttributeSelects",
  component: HierarchyAttributeSelects,
};

const Template = (args) => <HierarchyAttributeSelects {...args} />;

export const DefaultView = Template.bind({});
DefaultView.args = {
  hierarchyAttributes: ["Category", "Sub-category", "Item"], // Example hierarchy attributes
  attributeValues: {
    Appliances: {
      Electronics: {
        TV: ["LED", "LCD"],
        Mobile: ["Android", "iOS"],
      },
    },
    Clothing: {
      Shoes: {
        Men: ["Jeans", "Chinos"],
        Women: ["Leggings", "Linen"],
      },
    },
  },
  onChange: (selectedValues) => {
    console.log("Selected values:", selectedValues);
  },
  options: {
    isMulti: true, // Example option to allow multiple selections
  },
};

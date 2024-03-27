import { CreatableScriptedSelects } from "../../IpaControls/CreatableScriptedSelects";

export default {
  title: "Controls/CreatableScriptedSelects",
  component: CreatableScriptedSelects,
  argTypes: { onClick: { action: "onClick" } },
};

const Template = (args) => {
  return <CreatableScriptedSelects {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  currentValue: {
    // Define initial current value for each select
    select1: ["value1"],
    select2: ["value2"],
    // Add more selects as needed
  },
  onChange: (newValue) => {
    console.log("New value:", newValue);
    // Add your onChange logic here if needed
  },
  multi: true, // Define whether it's a multi-select or not
  script: "your-script-here", // Define the script to fetch options
  disabled: false, // Define whether the selects are disabled or not
  filterInfo: {
    // Define filter info if needed
    filter1: "value1",
    filter2: "value2",
    // Add more filters as needed
  },
  compact: false, // Define whether the selects are compact or not
  horizontal: false, // Define whether the selects are displayed horizontally or not
  selectOverrideStyles: {
    // Define select override styles if needed
  },
  highlightedOptions: ["value1", "value2"], // Define highlighted options if needed
  placeholder: "Select...", // Define the placeholder text
  isClearable: true, // Define whether the selects are clearable or not
  reloadTrigger: 0, // Define a reload trigger if needed
};

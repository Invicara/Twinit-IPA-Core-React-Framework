import { CreatableScriptedSelects } from "../../IpaControls/CreatableScriptedSelects";
import { useArgs } from "@storybook/client-api";

export default {
  title: "Controls/CreatableScriptedSelects",
  component: CreatableScriptedSelects,
  argTypes: { onChange: { action: "onChange" } },
};

const Template = (args) => {
  const [_, updateArgs] = useArgs();

  const handleChange = (e) => {
    updateArgs({
      ...args,
      currentValue: e,
    });
  };
  return <CreatableScriptedSelects {...args} onChange={handleChange} />;
};

export const Default = Template.bind({});

Default.args = {
  currentValue: {
    // Define initial current value for each select
    select1: ["value1"],
    select2: ["value2"],
  },
  onChange: (newValue) => {},
  multi: true,
  script: "your-script-here",
  disabled: false,
  filterInfo: {
    filter1: "value1",
    filter2: "value2",
  },
  compact: false,
  horizontal: false,
  selectOverrideStyles: {},
  highlightedOptions: ["value1", "value2"],
  placeholder: "Select...",
  isClearable: true,
  reloadTrigger: 0,
  isTest: true,
};

import { AdvancedSearch } from "../../IpaControls/AdvancedSearch";

export default {
  title: "Controls/AdvancedSearch",
  component: AdvancedSearch,
  argTypes: {
    onChange: { action: "onChange" },
    onFetch: { action: "onFetch" },
  },
};

const Template = (args) => {
  return <AdvancedSearch {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  currentValue: { filters: {} },
  display: "Search",
  searchable: {
    name: "name",
    age: "age",
  },
};

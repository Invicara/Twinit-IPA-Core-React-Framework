import FilterControl from "../../IpaControls/FilterControl";

export default {
  title: "Controls/FilterControl",
  component: FilterControl,
};

const Template = (args) => {
  return <FilterControl {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  className: "assets-filter",
  placeholder: "Choose filters",
  filters: [
    {
      name: { op: "contains", value: "Entity" },
      type: { op: "equals", value: "Type A" },
      date: { op: "greater than", value: new Date(2023, 0, 1) },
    },
  ],
  availableFilters: [
    {
      name: { type: "text" },
      type: { type: "single-pick", values: ["Type A", "Type B"] },
      date: { type: "date" },
    },
  ],
  availableOperators: ["equals", "contains", "greater than"],
  onChange: (filters) => console.log("Filters changed:", filters),
  entitySingular: "Entity",
};

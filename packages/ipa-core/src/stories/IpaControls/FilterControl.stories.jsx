import FilterControl, { applyFilters } from "../../IpaControls/FilterControl";
import React from "react";
import { action } from "@storybook/addon-actions";

export default {
  title: "Controls/FilterControl",
  component: FilterControl,
};

// Mock data for the Storybook story
const mockData = [
  {
    id: 1,
    name: "John Doe",
    age: 30,
    department: "Engineering",
    startDate: 1620144000000,
  }, // May 5, 2021
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    department: "Marketing",
    startDate: 1630444800000,
  }, // September 1, 2021
  {
    id: 3,
    name: "Bob Johnson",
    age: 35,
    department: "Finance",
    startDate: 1609459200000,
  }, // January 1, 2021
  {
    id: 4,
    name: "Alice Williams",
    age: 28,
    department: "Engineering",
    startDate: 1640995200000,
  }, // January 1, 2022
];

// Function to apply filters and get filtered data
const applyFiltersAndGetFilteredData = (filters) => {
  return applyFilters(mockData, filters, (item, property) => {
    switch (property) {
      case "name":
        return item.name.toLowerCase();
      case "age":
        return item.age;
      case "department":
        return item.department.toLowerCase();
      case "startDate":
        return { val: item.startDate, type: "date", epoch: item.startDate };
      default:
        return null;
    }
  });
};

// Template function to render FilterControl component with dynamic data
const Template = (args) => {
  const [filters, setFilters] = React.useState({});

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const filteredData = applyFiltersAndGetFilteredData(newFilters);
    action("Filtered Data")(filteredData); // Log filtered data to actions panel
  };

  return (
    <FilterControl {...args} filters={filters} onChange={handleFilterChange} />
  );
};

// Default story exported as "Default"
export const Default = Template.bind({});
Default.args = {
  availableFilters: {
    name: { type: "text" },
    age: { type: "number" },
    department: { type: "text" },
    startDate: { type: "date" },
  },
  availableOperators: [
    "equals",
    "does not equal",
    "contains",
    "does not contain",
    "less than",
    "greater than",
    "between",
    "in",
    "is not in",
  ],
  placeholder: "Choose filters",
};

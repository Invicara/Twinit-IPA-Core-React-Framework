import { EnhancedPickListSelect } from "../../IpaControls/EnhancedPickListSelect";

export default {
  title: "Controls/EnhancedPickListSelect",
  component: EnhancedPickListSelect,
};

const Template = (args) => {
  return <EnhancedPickListSelect {...args} />;
};

export const Default = Template.bind({});

const mockSelectsConfig = [
  { display: "Option 1", createPickListOnUpdate: true },
  { display: "Option 2", createPickListOnUpdate: false },
  // Add more selectors as needed
];

// Mock initial value for currentValue
const mockInitialValue = {
  "Option 1": [{ value: "value1", display: "Value 1" }],
  "Option 2": [{ value: "value2", display: "Value 2" }],
  // Add initial values for other selectors as needed
};

// Mock function to fetch options
const mockFetchOptions = async (currentSelect, currentSelectValue) => {
  // Simulate fetching options asynchronously
  return [
    { value: "value1", display: "Value 1" },
    { value: "value2", display: "Value 2" },
    // Add more mock options as needed
  ];
};

// Mock pickListScript and updateScript
const mockPickListScript = "mockPickListScript";
const mockUpdateScript = "mockUpdateScript";

// Mock props for testing EnhancedPickListSelect component
Default.args = {
  currentValue: mockInitialValue,
  onChange: (newValue) => console.log("New value:", newValue),
  disabled: false,
  selects: mockSelectsConfig,
  compact: false,
  horizontal: false,
  selectOverrideStyles: null,
  isClearable: true,
  pickListScript: mockPickListScript,
  initialPickListType: "initialPickListType",
  canCreateItems: true,
  updateScript: mockUpdateScript,
};

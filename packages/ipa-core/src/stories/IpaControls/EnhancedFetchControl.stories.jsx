import EnhancedFetchControl from "../../IpaControls/EnhancedFetchControl"; // Adjust the path accordingly

export default {
  title: "Controls/EnhancedFetchControl",
  component: EnhancedFetchControl,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    doFetch: { actions: "doFetch" },
  },
};

const Template = (args) => {
  return <EnhancedFetchControl {...args} />;
};

export const Default = Template.bind({});

const mockSelectors = [
  {
    id: 0,
    label: "Selector 1",
    currentValue: null,
    currentState: null,
    touched: false,
    query: "<<TEXT_SEARCH>>",
  },
  {
    id: 1,
    label: "Selector 2",
    currentValue: null,
    currentState: null,
    touched: false,
    query: "<<TEXT_SEARCH>>",
  },
  // Add more selectors as needed
];

// Mock function to simulate fetching data
const mockFetchData = (selector, value) => {
  console.log(`Fetching data for ${selector.label} with value ${value}`);
  // Simulate fetching data asynchronously
  return new Promise((resolve) => {
    setTimeout(() => {
      // Resolve with mock data
      resolve(`Data fetched for ${selector.label} with value ${value}`);
    }, 1000); // Simulate a delay of 1 second
  });
};

// Mock props for testing EnhancedFetchControl component
Default.args = {
  selectors: mockSelectors,
  initialValue: null,
  disable: false,
  reloadToken: null,
  shouldClearToken: null,
  doFetch: mockFetchData, // Pass the mock fetch function
};

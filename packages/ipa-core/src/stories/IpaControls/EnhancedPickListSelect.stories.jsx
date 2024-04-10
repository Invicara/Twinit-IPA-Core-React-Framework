import React, { useState } from "react";
import { storiesOf } from "@storybook/react";

import { EnhancedPickListSelect } from "../../IpaControls/EnhancedPickListSelect";

// Define a Storybook story for the EnhancedPickListSelect component
storiesOf("Controls/EnhancedPickListSelect", module).add(
  "Dynamic Option Add",
  () => {
    // Define the initial state for the component
    const [currentValue, setCurrentValue] = useState({});
    const [options, setOptions] = useState([]);

    // Function to handle adding a new option
    const handleAddOption = () => {
      const newOption = {
        value: "new_option_value",
        label: "New Option",
      };

      // Update the options list
      setOptions([...options, newOption]);

      // Update the current value with the new option
      setCurrentValue({
        ...currentValue,
        // You can modify the key 'select_id' based on your actual use case
        select_id: [newOption], // This adds the new option to the specified select
      });
    };

    const mockInitialValue = {
      "Input 1": [{ value: "value1", display: "Value 1" }],
      "Input 2": [{ value: "value2", display: "Value 2" }],
      // Add initial values for other selectors as needed
    };

    return (
      <div>
        <EnhancedPickListSelect
          currentValue={mockInitialValue}
          onChange={(newValue) => setCurrentValue(newValue)}
          disabled={false}
          selects={[
            {
              display: "Input 1", // Specify the select ID you want to update with new options
              createPickListOnUpdate: true, // Ensure the select supports creating new options
            },
            {
              display: "Input 2", // Specify the select ID you want to update with new options
              createPickListOnUpdate: true, // Ensure the select supports creating new options
            },
            // Add more select configurations as needed
          ]}
          compact={false}
          horizontal={false}
          selectOverrideStyles={null} // Provide custom styles if needed
          isClearable={true}
          pickListScript={null}
          initialPickListType={null}
          canCreateItems={true} // Enable option creation
          updateScript={null}
        />
      </div>
    );
  },
);

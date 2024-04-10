import React, { useState } from "react";
import { storiesOf } from "@storybook/react";

import { EnhancedPickListSelect } from "../../IpaControls/EnhancedPickListSelect";

// Define a Storybook story for the EnhancedPickListSelect component
storiesOf("Controls/EnhancedPickListSelect", module).add(
  "Dynamic Option Add",
  () => {
    const [currentValue, setCurrentValue] = useState({});
    const [options, setOptions] = useState([]);

    const mockInitialValue = {
      "Input 1": [
        { value: "value1", display: "Add new value to options list" },
      ],
      "Input 2": [
        { value: "value2", display: "Add new value to options list" },
      ],
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

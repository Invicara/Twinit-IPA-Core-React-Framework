import React, { useState } from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { ScriptedLinkedSelects } from "../../IpaControls/EnhancedScriptedLinkedSelects";
import { useArgs } from "@storybook/client-api";

// Mock selects configuration
const mockSelects = [
  {
    display: "Item",
    script: "getCollectionTypesFlat",
  },
  {
    display: "Color",
    multi: false,
    script: "getCollectionNames",
    required: false,
  },
];

// Define the Storybook story for the ScriptedLinkedSelects component
storiesOf("Controls/ScriptedLinkedSelects", module).add("Default", () => {
  const [_, updateArgs] = useArgs();
  const [currentValue, setCurrentValue] = useState();
  const handleChange = (e) => {
    setCurrentValue(e);
  };

  return (
    <ScriptedLinkedSelects
      currentValue={currentValue}
      onChange={handleChange}
      touched={false}
      noFetch={false}
      onFetch={action("onFetch")}
      selects={mockSelects}
      compact={false}
      horizontal={false}
      selectOverrideStyles={null}
      highlightedOptions={{ "Select 1": ["option 1"] }} // Mock highlighted options for Select 1
      placeholders={{ "Select 1": "Select an option..." }} // Mock placeholders for Select 1
      isClearable={true}
      disabled={false}
      isTest={true}
    />
  );
});

import React, { useState } from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { ScriptedSelects } from "../../IpaControls/EnhancedScriptedSelects";
import { useArgs } from "@storybook/client-api";

const mockScript = async () => {
  // Mock implementation that returns options
  return {
    OptionSet1: ["Option A", "Option B", "Option C"],
    OptionSet2: ["Option X", "Option Y", "Option Z"],
  };
};

// Define the Storybook story for the ScriptedSelects component
storiesOf("Controls/ScriptedSelects", module).add("Static Example", () => {
  const [_, updateArgs] = useArgs();
  const [currentValue, setCurrentValue] = useState();
  const handleChange = (e) => {
    setCurrentValue(e);
  };

  return (
    <ScriptedSelects
      currentValue={currentValue}
      onChange={handleChange}
      touched={false}
      noFetch={false}
      compact={false}
      horizontal={false}
      selectOverrideStyles={null}
      onFetch={mockScript} // Use mockScript for testing
      multi={false}
      placeholder="Select an option..."
      highlightedOptions={[]}
      isClearable={true}
      script="mockScript"
      disabled={false}
      isTest={true}
    />
  );
});

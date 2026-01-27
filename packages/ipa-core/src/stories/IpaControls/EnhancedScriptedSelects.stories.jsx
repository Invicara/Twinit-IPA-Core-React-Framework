import React, { useState } from "react";
import { useArgs } from "@storybook/preview-api";
import { ScriptedSelects } from "../../IpaControls/EnhancedScriptedSelects";
import { action } from "@storybook/addon-actions";

const mockScript = async () => {
    return {
        OptionSet1: ["Option A", "Option B", "Option C"],
        OptionSet2: ["Option X", "Option Y", "Option Z"],
    };
};

export default {
    title: "Controls/ScriptedSelects",
    component: ScriptedSelects,
};

export const StaticExample = () => {
    const [, updateArgs] = useArgs(); // keep if you plan to sync args later
    const [currentValue, setCurrentValue] = useState();

    const handleChange = (e) => {
        setCurrentValue(e);
        // Optional: sync to Storybook controls panel if you add args for currentValue
        action("onChange")(e);
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
            onFetch={mockScript}
            multi={false}
            placeholder="Select an option..."
            highlightedOptions={[]}
            isClearable={true}
            script="mockScript"
            disabled={false}
            isTest={true}
        />
    );
};

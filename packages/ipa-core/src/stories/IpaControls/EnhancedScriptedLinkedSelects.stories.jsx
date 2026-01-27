import React, { useState } from "react";
import { useArgs } from "@storybook/preview-api";
import { action } from "@storybook/addon-actions";
import { ScriptedLinkedSelects } from "../../IpaControls/EnhancedScriptedLinkedSelects";

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

export default {
    title: "Controls/ScriptedLinkedSelects",
    component: ScriptedLinkedSelects,
};

export const Default = () => {
    const [, updateArgs] = useArgs(); // keep if you plan to sync args later
    const [currentValue, setCurrentValue] = useState();

    const handleChange = (e) => {
        setCurrentValue(e);
        // Optional: sync to Storybook controls
        // updateArgs({ currentValue: e });
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
            highlightedOptions={{ "Select 1": ["option 1"] }}
            placeholders={{ "Select 1": "Select an option..." }}
            isClearable={true}
            disabled={false}
            isTest={true}
        />
    );
};

import React, { useState } from "react";
import { EnhancedPickListSelect } from "../../IpaControls/EnhancedPickListSelect";

export default {
    title: "Controls/EnhancedPickListSelect",
    component: EnhancedPickListSelect,
};

export const DynamicOptionAdd = () => {

    const mockInitialValue = {
        "Input 1": [{ value: "value1", display: "Add new value to options list" }],
        "Input 2": [{ value: "value2", display: "Add new value to options list" }],
    };

    const [currentValue, setCurrentValue] = useState(mockInitialValue);

    return (
        <div>
            <EnhancedPickListSelect
                currentValue={currentValue}
                onChange={(newValue) => setCurrentValue(newValue)}
                disabled={false}
                selects={[
                    {
                        display: "Input 1",
                        createPickListOnUpdate: true,
                    },
                    {
                        display: "Input 2",
                        createPickListOnUpdate: true,
                    },
                ]}
                compact={false}
                horizontal={false}
                selectOverrideStyles={null}
                isClearable={true}
                pickListScript={null}
                initialPickListType={null}
                canCreateItems={true}
                updateScript={null}
            />
        </div>
    );
};

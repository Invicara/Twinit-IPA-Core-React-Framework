import React from "react";

import '../IpaStyles/DbmTooltip.scss'

export const leafNodeRenderer = (entity) => 
(<div>{entity["Entity Name"]} 
    { entity["EntityWarningMessage"] && 
    <div className="tooltip-wrapper">
        <div className="dbm-tooltip">
            <i className="fas fa-exclamation-circle"/>
            <span className="dbm-tooltiptext">{entity["EntityWarningMessage"]}</span>
        </div>
    </div>}
</div>);

export const branchNodeRenderer = (groupName, values) => {
    const sumChildren = (values, acc) => {
        if (Array.isArray(values)) {
            return acc + values.length
        }
        Object.keys(values).forEach(key => {
            acc = sumChildren(values[key], acc)
        })
        return acc
    }
    return (
        <span>
            {groupName}
            <span className="count" style={{fontSize: "0.8em"}}>{sumChildren(values, 0)}</span>
          </span>
    )
};

export default TreeRendererHelper = {
    leafNodeRenderer,
    branchNodeRenderer
}
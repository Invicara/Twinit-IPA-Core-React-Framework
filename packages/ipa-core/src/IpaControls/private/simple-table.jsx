import React from "react";
import SimpleTable from "../SimpleTable";

export const SimpleTableFactory = {
    create: ({config, data}) => {
        if (config.columns)
            return <SimpleTable className={config.className} objects={data} columns={config.columns}/>
        else
            return <SimpleTable className={config.className} rows={data} />
    }
}

export const SimpleTableGroupFactory = {
    create: ({config, data}) => {

        // to do - pass in a getRow func as part of config?
        const _getRow = (obj) => {

            if (obj && obj.dName)
                return [
                    obj.dName,
                    typeof(obj.val)!='undefined' ? (obj.val + (obj.uom ? " " + obj.uom : "")): ""
                ]
            else
                return [
                    "Configured property does not exist", ""
                ]
        }

        let groupedData = {}
        let assigned = new Set()
        Object.keys(config.groups).forEach(g => {
            let rows = []
            config.groups[g].filter(attr => !(config.hidden || []).includes(attr)).forEach(attr => {
                rows.push(_getRow(data[attr]))
                assigned.add(attr)
            })
            groupedData[g] = rows
        })
        let remaining = []
        Object.keys(data).sort().forEach(attr => {
            if (!assigned.has(attr)) {
                remaining.push(_getRow(data[attr]))
            }
        })
        groupedData["Other"] = remaining

        let components = Object.keys(config.groups).map(g =>
            <div key={"table-for-group-"+g} className="simple-table-group">
                <div className={config.groupClassName}>{g}</div>
                <SimpleTable className={config.tableClassName} rows={groupedData[g]} />
            </div>
        )

        //only add Other group if there are other entries
        if (groupedData["Other"].length)
            components.push(
                <div key={"table-for-group-other"} className="simple-table-group">
                    <div className={config.groupClassName}>Other</div>
                    <SimpleTable className={config.tableClassName} rows={groupedData["Other"]} />
                </div>
            )

        return (
            <div className={"simple-grouped-table " + config.className}>
                {components}
            </div>
        )
    }
}
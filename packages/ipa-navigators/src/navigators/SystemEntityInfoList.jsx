import React from "react";
import {SimpleTable} from "@invicara/ipa-core/modules/IpaControls";

const SystemEntityInfoList = ({entities, entityType}) => {

    const args = {
        columns: [{
            name: "Element Name",
            accessor: "Entity Name"
        },/*{
            name: "Revit Family",
            accessor: "properties.Revit Family.val"
        },{
            name: "Revit Type",
            accessor: "properties.Revit Type.val"
        },{
            name: "System Element Id",
            accessor: "properties.SystemelementId.val"
        }*/],
        objects: entities
    };

    return <div className="bottom-panel-content-right">
        <div className="bottom-panel-content-right__wrapper">
        <SimpleTable className="simple-property-grid" {...args}/>
        </div></div>
}

export default SystemEntityInfoList;
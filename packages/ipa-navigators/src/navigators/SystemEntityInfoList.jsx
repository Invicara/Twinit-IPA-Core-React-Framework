/**
 * ****************************************************************************
 *
 * INVICARA INC CONFIDENTIAL __________________
 *
 * Copyright (C) [2012] - [2020] INVICARA INC, INVICARA Pte Ltd, INVICARA INDIA
 * PVT LTD All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains the property of
 * Invicara Inc and its suppliers, if any. The intellectual and technical
 * concepts contained herein are proprietary to Invicara Inc and its suppliers
 * and may be covered by U.S. and Foreign Patents, patents in process, and are
 * protected by trade secret or copyright law. Dissemination of this information
 * or reproduction of this material is strictly forbidden unless prior written
 * permission is obtained from Invicara Inc.
 */

import React, {useEffect, useState, useCallback, useMemo, useContext, useRef} from "react";
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
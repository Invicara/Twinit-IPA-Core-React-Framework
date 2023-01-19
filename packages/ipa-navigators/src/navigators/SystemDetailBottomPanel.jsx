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
import SystemEntityInfoDetailBottomPanel from "./SystemEntityInfoDetailBottomPanel";
import './SystemDetailBottomPanel.scss'
import SystemEntityInfoList from "./SystemEntityInfoList";

const SystemDetailBottomPanel = ({/*props from parent component*/
                                 entities, userConfig, entityType}) => {

    return entities.length > 1 ? <SystemEntityInfoList entities={entities} entityType={entityType}/> : <SystemEntityInfoDetailBottomPanel
        detailedEntity={entities && entities.length> 0 ? entities[0] : entities}
        userConfig={userConfig}
        entityType={entityType}
        ></SystemEntityInfoDetailBottomPanel>;
}

export default SystemDetailBottomPanel;
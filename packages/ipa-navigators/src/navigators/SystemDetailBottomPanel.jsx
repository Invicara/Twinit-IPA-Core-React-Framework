import React from "react";
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
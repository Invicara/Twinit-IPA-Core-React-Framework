import React, {useMemo} from "react";
import {useSelector} from "react-redux";
import _ from 'lodash'
import {AlertIndicator} from "@invicara/ipa-core/modules/IpaControls";
import * as Systems from "../redux/slices/systems";

const SystemAlertsList = ({system}) => {

    const alertsLoadingStatus = useSelector(Systems.selectSystemsAlertsLoadingStatus);
    const alerts = useSelector(Systems.selectSystemsAlerts);

    const isolatedAlerts = useMemo(()=>{
        let uniqueAlertsMap = {};
        for (const [entityType, alertsPerEntity] of Object.entries(alerts || {})) {
            for (const [entityId, alertsArray] of Object.entries(alertsPerEntity)) {
                alertsArray.forEach(alert=>{
                    if(!uniqueAlertsMap[alert._id]){
                        uniqueAlertsMap[alert._id] = alert;
                    }
                });
            }
        }
        return uniqueAlertsMap;
    },[alerts]);

    return <div className="p-h-10 p-v-10">
        {alertsLoadingStatus == 'loading' ? <span><i className="fas fa-spinner fa-spin"></i> Loading alerts...</span> :
        (<div>
            {!_.isEmpty(isolatedAlerts) ? <span><AlertIndicator classNames={"alert-indicator-danger"} descriptions={_.values(isolatedAlerts).map(alert=>alert?.properties?.Description?.val).filter(d=>!!d)}></AlertIndicator>Found {_.keys(isolatedAlerts).length} alerts.</span> : <span>No alerts found</span>}
        </div>)}</div>
}

export default SystemAlertsList


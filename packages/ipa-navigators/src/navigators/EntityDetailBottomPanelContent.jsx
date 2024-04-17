import React, {useEffect, useReducer} from "react";

import {
    EntityDataContainer,
    EntityDataGroupContainer
} from "@invicara/ipa-core/modules/IpaPageComponents";
import _ from 'lodash'
import { ScriptHelper } from "@invicara/ipa-core/modules/IpaUtils";
import { AlertIndicator } from "@invicara/ipa-core/modules/IpaControls";

const groupAlertsReducer = (state, action) => {
    switch(action.type) {
        case "START_FETCHING":
            return {...state, [action.payload.key]: {loading: true}}
        case "PUSH_ALERT":
            return {...state, [action.payload.key]: {loading: false, alerts: action.payload.alerts}}
        case "PUSH_ERROR":
            return {...state, [action.payload.key]: {loading: false, error: action.payload.error}}
        default:
            return state
    }
}

const EntityDetailBottomPanelContent = ({config, getData, loadingDataGroups, detailedEntity, filteredDataGroups, selectedDataGroup: focusedGroup, onSelectedGroupChanged}) => {

    //if selected group comes from different entity, make sure it's disregarded and using a default
    const selectedDataGroup = filteredDataGroups.indexOf(focusedGroup)>-1 ? focusedGroup : filteredDataGroups[0];
    const groupConfig = _.get(config, `data[${selectedDataGroup}]`);

    const [groupAlerts, dispatchGroupAlerts] = useReducer(groupAlertsReducer, {});

    useEffect(() => {
        filteredDataGroups.forEach(dg => {
            const dgConfig = _.get(config, `data[${dg}]`);
            if(dgConfig.alerts?.script) {
                dispatchGroupAlerts({type: "START_FETCHING", payload: {key: dg}})
                ScriptHelper.executeScript(
                    dgConfig.alerts.script, 
                    {
                        entityId: detailedEntity._id,
                        query: dgConfig.alerts.query
                    }
                )
                .then((response) => {
                    let alerts = undefined;
                    if(_.isArray(response) && response.length > 0) {
                        alerts = [...response];
                    }
                    dispatchGroupAlerts({type: "PUSH_ALERT", payload: {key: dg, alerts}})
                })
                .catch((error) => dispatchGroupAlerts({type: "PUSH_ERROR", payload: {key: dg, error}}))
            }

        })
    }, [filteredDataGroups, config, detailedEntity])

    const {data,error,fetching,reset} = EntityDataContainer.useEntityData(false, false, detailedEntity, groupConfig, getData, selectedDataGroup);

    return <React.Fragment>
        <div className="bottom-panel-content-left">
            {!loadingDataGroups && filteredDataGroups.map(dg => {
                console.log("EntityDetailBottomPanelContent render filteredDataGroups.map dg", dg)
                let alertsObject = groupAlerts[dg];
                return <div
                    className={`bottom-panel__data-group-tab ${dg === selectedDataGroup && 'selected'}`}
                    onClick={() => {
                        reset();
                        onSelectedGroupChanged(dg);
                    }}
                    key={dg}
                >
                    {dg}
                    {alertsObject?.loading === false && alertsObject?.alerts &&  (
                        <AlertIndicator descriptions={alertsObject?.alerts}/>
                    )}
                </div>
            })}
        </div>
        <div className="bottom-panel-content-right">
            <div className="bottom-panel-content-right__wrapper">
                {!(groupConfig && groupConfig.component && groupConfig.component.chart) && <div className="bottom-panel-data-group-title">{selectedDataGroup}</div>}

                {!loadingDataGroups && config && error &&
                    <div>
                        <p>An unexpected error happened, please try again later.</p>
                    </div>
                }
                {!loadingDataGroups && config && !error &&
                    <EntityDataGroupContainer.default
                        config={groupConfig}
                        collapsable={false}
                        data={data}
                        fetching={fetching}
                    />
                }
            </div>
        </div>
    </React.Fragment>
}

export default EntityDetailBottomPanelContent
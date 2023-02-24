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
import {Entities} from "@invicara/ipa-core/modules/IpaRedux";

import {
    withEntitySearch, withEntityAvailableGroups
} from "@invicara/ipa-core/modules/IpaPageComponents";
import EntityDetailBottomPanelContent from "./EntityDetailBottomPanelContent";
import NavigatorSource from "./NavigatorSource";
import {compose} from "redux";
import {connect} from "react-redux";

const EntityDetailBottomPanel = ({/*props from HOC withEntityStore, HOC withEntitySearch, HOC withEntityConfig, HOC withEntityAvailableGroups*/
                                 availableDataGroups, loadingDataGroups, entitySingular, perEntityConfig, getEntityExtendedData, userConfig,
                                 /*props from parent component*/
                                 detailedEntity}) => {


    const filteredDataGroups = useMemo(() => availableDataGroups[entitySingular] ? Object.entries(availableDataGroups[entitySingular]).filter(([k, v]) => v === true).map(([k, v]) => k) : [], [availableDataGroups,entitySingular]);
    const [selectedDataGroup, setSelectedDataGroup] = useState(filteredDataGroups[0]);

    const onSelectedGroupChanged = useCallback((dg)=>setSelectedDataGroup(dg),[]);

    useEffect(() =>{
        setSelectedDataGroup(filteredDataGroups[0])
    }, [filteredDataGroups])

    //TODO: please move that to HOC, it's duplicated code (but please test EntityView first)
    const currentEntityExtendedDataConfig = useMemo(() => {
        let newCurrentConfig = {...perEntityConfig[entitySingular]}
        const defaultExtendedDataConfig = userConfig.entityDataConfig?.[entitySingular];
        if(defaultExtendedDataConfig){
            const newCurrentConfigDataAsEntries = Object.entries(defaultExtendedDataConfig)
                .map((defaultDataConfig, key) => {
                    if(newCurrentConfig.data) {
                        return {...defaultDataConfig, ...newCurrentConfig.data?.[key]}
                    } else {
                        return {...defaultDataConfig}
                    }
                })
            newCurrentConfig.data = Object.fromEntries(newCurrentConfigDataAsEntries)
        }
        return newCurrentConfig;
    },[perEntityConfig,userConfig,entitySingular]);

    const getDataFn = useMemo(()=>getEntityExtendedData(currentEntityExtendedDataConfig?.data),[perEntityConfig,userConfig,entitySingular]);

    return <EntityDetailBottomPanelContent
            config={perEntityConfig[entitySingular]}
            getData={getDataFn}
            loadingDataGroups={loadingDataGroups}
            selectedDataGroup={selectedDataGroup}
            filteredDataGroups={filteredDataGroups}
            onSelectedGroupChanged={onSelectedGroupChanged}
            detailedEntity={detailedEntity}></EntityDetailBottomPanelContent>
}

export default withEntitySearch(withEntityAvailableGroups(EntityDetailBottomPanel))
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
    withEntityAvailableGroups,
    withEntityConfig,
    withEntitySearch
} from "@invicara/ipa-core/modules/IpaPageComponents";
import EntityDetailBottomPanelContent from "./EntityDetailBottomPanelContent";
import NavigatorSource from "./NavigatorSource";
import {compose} from "redux";
import {connect} from "react-redux";
import _ from "lodash";

const SystemEntityInfoDetailBottomPanel = ({/*props from HOC withEntityConfig*/
                                     initialAvailableDataGroups, findAvailableDataGroups, perEntityConfig, getEntityExtendedDataFetcher,
                                     /*props from parent component*/
                                     detailedEntity, userConfig, entityType}) => {

    const [loadingDataGroups, setLoadingDataGroups] = useState(false);
    //these are available data groups for all
    const [availableDataGroups, setAvailableDataGroups] = useState(_.cloneDeep(initialAvailableDataGroups));

    const filteredDataGroups = useMemo(() => availableDataGroups[entityType] ? Object.entries(availableDataGroups[entityType]).filter(([k, v]) => v === true).map(([k, v]) => k) : [], [availableDataGroups,entityType]);

    const [selectedDataGroup, setSelectedDataGroup] = useState(filteredDataGroups[0]);

    const onSelectedGroupChanged = useCallback((dg)=>setSelectedDataGroup(dg),[]);

    const onDataGroupsLoaded = useCallback(()=>setLoadingDataGroups(false),[]);

    const onDataGroupAvailable = useCallback((entityType, dataGroupName, val)=>{
        let dataGroups = _.cloneDeep(initialAvailableDataGroups);
        dataGroups[entityType] = availableDataGroups[entityType] || {};
        dataGroups[entityType][dataGroupName] = val;
        setAvailableDataGroups(dataGroups);
    },[initialAvailableDataGroups]);

    useEffect(() =>{
        setSelectedDataGroup(filteredDataGroups[0])
    }, [filteredDataGroups])

    useEffect(() =>{
        setSelectedDataGroup(filteredDataGroups[0])
    }, [filteredDataGroups])

    useEffect(()=> {
        setLoadingDataGroups(true);
        //fetch available data groups
        findAvailableDataGroups(detailedEntity, false, entityType, onDataGroupAvailable, onDataGroupsLoaded)
    },[detailedEntity]);

    //TODO: please move that to HOC, it's duplicated code (but please test EntityView first)
    const currentEntityExtendedDataConfig = useMemo(() => {
        let newCurrentConfig = {...perEntityConfig[entityType]}
        const defaultExtendedDataConfig = userConfig.entityDataConfig?.[entityType];
        if(defaultExtendedDataConfig) {
            const newCurrentConfigDataAsEntries = Object.entries(defaultExtendedDataConfig)
                .map((defaultDataConfig, key) => {
                    if (newCurrentConfig.data) {
                        return {...defaultDataConfig, ...newCurrentConfig.data?.[key]}
                    } else {
                        return {...defaultDataConfig}
                    }
                })
            newCurrentConfig.data = Object.fromEntries(newCurrentConfigDataAsEntries)
        }
        return newCurrentConfig;
    },[perEntityConfig,userConfig,entityType]);

    const getDataFn = useMemo(()=>getEntityExtendedDataFetcher(currentEntityExtendedDataConfig?.data),[perEntityConfig,userConfig,entityType]);

    return <EntityDetailBottomPanelContent
        config={perEntityConfig[entityType]}
        getData={getDataFn}
        loadingDataGroups={loadingDataGroups}
        selectedDataGroup={selectedDataGroup}
        filteredDataGroups={filteredDataGroups}
        onSelectedGroupChanged={onSelectedGroupChanged}
        detailedEntity={detailedEntity}></EntityDetailBottomPanelContent>
}

export default withEntityConfig(SystemEntityInfoDetailBottomPanel);
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import _ from 'lodash'
import {SimpleSelect} from "@invicara/ipa-core/modules/IpaControls";
import {
    setIsolatedSystemElementEntities,
} from "../redux/slices/systems";
import {Divider} from "@material-ui/core";
import {Systems} from "@invicara/ipa-core/modules/IpaRedux";
import {SystemsListTree} from "./SystemsListTree";
import SystemAlertsList from "./SystemAlertsList";
import {withGenericPageContext, withGenericErrorBoundary} from "@invicara/ipa-core/modules/IpaPageComponents";

const SystemSearchPanel = ({rootEntity, rootEntityType, viewerMode, isSystemDrawerOpen, onSystemChanged, bottomPanelFocusMode, onBottomPanelFocusModeChanged, handler}) => {


    const dispatch = useDispatch();

    //before start make sure we have all the scripts set
    handler?.config?.panels?.Systems && dispatch(Systems.updateConfig(handler?.config?.panels?.Systems));

    const loadingStatus = useSelector(Systems.selectSystemsLoadingStatus);
    const selectedEntitiesBySystem = useSelector(Systems.selectedSystemElementEntities);

    const systems = useSelector(Systems.selectSystemEntitiesMap);
    const systemNameOptions = useMemo(()=>Object.values(systems).map(s=>s['System Name']),[systems])

    const [system, setSystem] = useState(undefined);

    const [selectedSystemName, setSelectedSystemName] = useState(system ? system['System Name'] : undefined);
    const onSelectedSystemNameChanged = useCallback((systemName)=>setSelectedSystemName(systemName),[]);

    const onSelectedSystemElements = useCallback((selected, changed)=>{
        if(!_.isEmpty(changed)) {
            dispatch(Systems.setSelectedSystemElementEntitiesFromIds(selected, changed));
            //dispatch(Systems.setFocusedSystemElementEntity(undefined));
        }
    },[]);


    useEffect(() => {
        dispatch(Systems.fetchByEntityTypeAndId({entityInfo: rootEntity.entityInfo || rootEntity, entityType : rootEntityType}))
    }, [dispatch, rootEntity, rootEntityType]);

    useEffect(() => {
        if(!systems){
            if(system) setSystem(undefined);
            return;
        }
        let newSystem;
        if(selectedSystemName) {
            newSystem = Object.values(systems).find(s => s['System Name'] == selectedSystemName);
        }
        if(!newSystem) {
            newSystem = Object.values(systems)[0];
        }
        if(newSystem!==system) {
            setSystem(newSystem);
        }
    }, [systems,selectedSystemName]);

    useEffect(() => {
        if(system && selectedSystemName!=system['System Name']){
            setSelectedSystemName(system['System Name']);
        }
        const isolation = system ? system.elements : [];
        dispatch(setIsolatedSystemElementEntities(isolation));
        //initially select all elements that correspond to rootEntity model ids
        const selection = isolation.filter(e=>_.intersection(e.modelViewerIds, rootEntity.modelViewerIds).length>0);
        dispatch(Systems.setSelectedSystemElementEntities(selection));
        onSystemChanged && onSystemChanged(system)
    }, [system]);

    useEffect(() => {
        dispatch(Systems.fetchAlertsBySystem({system}));
    }, [system]);




    const getEntityName = (rootEntity, rootEntityType) => {
        if(rootEntity.entityInfo){
            return rootEntity.entityInfo[rootEntityType+' Name'] || rootEntity.entityInfo['Entity Name'];
        }
        return rootEntity[rootEntityType+' Name'] || rootEntity['Entity Name'];
    }

    return <div>
        <div className={'general-title'}>{getEntityName(rootEntity, rootEntityType)}<br/>Systems</div>

        {loadingStatus == 'loading' ? <p className="p-h-10">Loading systems...</p> :

            (<div>
                <SimpleSelect
                    className={'entity-select'}
                    placeholder={`Select System to View`}
                    options={systemNameOptions}
                    handleChange={onSelectedSystemNameChanged}
                    value={selectedSystemName}
                />
                <Divider />
                {system && <SystemAlertsList system={system}/>}
                {system && <SystemsListTree system={system} title="Test" selectedElements={selectedEntitiesBySystem} onSelect={onSelectedSystemElements} onBottomPanelFocusModeChanged={onBottomPanelFocusModeChanged} bottomPanelFocusMode={bottomPanelFocusMode}/>}
            </div>)
        }
    </div>
}

export default withGenericErrorBoundary(withGenericPageContext(SystemSearchPanel));


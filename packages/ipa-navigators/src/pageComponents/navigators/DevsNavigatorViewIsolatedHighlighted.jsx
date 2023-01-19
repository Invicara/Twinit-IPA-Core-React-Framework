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

import React, {useState, useMemo, useEffect, useRef, useCallback, useContext} from "react";
import PropTypes from "prop-types";
import {
    withEntityConfig
} from "@invicara/ipa-core/modules/IpaPageComponents";
import {useDispatch, useSelector} from "react-redux";
import {Entities} from "@invicara/ipa-core/modules/IpaRedux";
import {EnhancedIafViewer} from "../../navigators/devs/EnhancedIafViewer";
import { extractSpacesFromEntities } from "../../navigators/EntityEnabledIafViewer";
import {withEntityStore} from "@invicara/ipa-core/modules/IpaPageComponents";
import _ from "lodash";
import {IafScriptEngine} from "@invicara/platform-api";



const selectEntitiesFromIds = async (dispatch, spaceIdsArray, assetsIdsArray, selectedModelIds) => {

    const entityIdsToSelect =  (selectedModelIds || []);

    try {
        const spaceEntities = !!spaceIdsArray ? await getEntities(spaceIdsArray,"Space") : [];
        const assetEntities = !!assetsIdsArray ? await getEntities(assetsIdsArray,"Asset") : [];
        const entities = (spaceEntities || []).concat(assetEntities || []);
        console.log('entitiesGeneral dispatching entities: ', entities)
        dispatch(Entities.setEntities({entities: entities, shouldIsolate: true}));
        const filteredToSelect = entities.filter(e => entityIdsToSelect.includes( e._id) );
        dispatch(Entities.setSelectedEntities(filteredToSelect));
        console.log('entitiesGeneral dispatching setSelectedEntities: ', filteredToSelect)

    } catch (e) {
        console.error("There was an error selecting the model entity:", e)
    }
}

const getEntities = async (idsArray, singular) => {
    console.log('idsArray', idsArray);

    let collections = await IafScriptEngine.getCollections(null);
    collections = collections._list;

    let spaceColl = _.find(collections, { _userType: "iaf_ext_space_coll" });
    let assetColl = _.find(collections, { _userType: "iaf_ext_asset_coll" });

    let coll = singular == 'Asset' ? assetColl : spaceColl;

    let relatedQuery = {
        parent: {
            query: {
                "_id": {
                    "$in": idsArray
                }
            },
            collectionDesc: { _userType: coll._userType, _userItemId: coll._userItemId },
            options: { page: { getAllItems: true } }
        },
        related: [
            {
                relatedDesc: {
                    _relatedUserType: "rvt_elements",
                    //_relatedUserItemId: elemColl._userItemId,
                    _relatedUserItemVersionId: coll._userItemVersionId
                },
                options: { project: { _id: 1, package_id: 1 } },
                as: "revitElementIds"
            }
        ]
    }

    console.log(relatedQuery)

    let elements = await IafScriptEngine.findWithRelated(relatedQuery).catch((err) => {
        return err
    })

    console.log("elements",elements);

    let asEntities = elements._list.map((a) => {
        a.original = _.cloneDeep(a)
        a['Entity Name'] = singular == 'Space' ? a['Space Name'] : a['Asset Name']
        a.modelViewerIds = a.revitElementIds._list.map(e => e.package_id)
        return a
    })

    return asEntities

}

const DevsNavigatorView =  (props) => {

    const EMPTY_ARRAY = useMemo(()=>[],[]);

    const dispatch = useDispatch();

    const isolatedEntities = useSelector(Entities.getIsolatedEntities);
    const allEntities = useSelector(Entities.getAllCurrentEntities);
    const selectedEntities = useSelector(Entities.getSelectedEntities);
    const isolatedEntitiesColored = isolatedEntities;


    useEffect(()=>{
        selectEntitiesFromIds(dispatch,props.userConfig.spaceIdsArray,props.userConfig.assetIdsArray, props.userConfig.selectedModelIds);
    },[props.userConfig.spaceIdsArray,props.userConfig.assetIdsArray]);

    useEffect(()=>{
       console.log("entitiesGeneral selection changed: ",selectedEntities);
    },[selectedEntities]);

    useEffect(()=>{
        console.log("entitiesGeneral isolatedEntities changed: ",isolatedEntities);
    },[isolatedEntities]);

    useEffect(()=>{
        console.log("entitiesGeneral all entities changed: ",allEntities);
    },[allEntities]);


    const [themeColor, setThemeColor] = useState('#0000FF');


    const handleModelIdsSelectionFromViewer = viewerSelectedEntities => {
    }


    const {isolatedSpaces, isolatedRemainingEntities} = useMemo(()=>extractSpacesFromEntities(isolatedEntities||[]),[isolatedEntities]);


    const colorGroups = useMemo(() => {
        if(!props.userConfig.redSpaceIds && !props.userConfig.blueSpaceIds && !props.userConfig.greenSpaceIds){
            return undefined;
        }
        const groups = [];
        const group = {
            "groupName": "RedColor",
            "colors": []
        };
        if(props.userConfig.redSpaceIds){
            group.colors.push({
                "color": '#FF0000',
                "opacity": 1,
                "elementIds": isolatedEntities.filter(ie=>props.userConfig.redSpaceIds.includes(ie._id)).reduce((acc,e) => acc.concat(e.modelViewerIds),[])
            });
            groups.push(group);
        }
        if(props.userConfig.blueSpaceIds){
            const group = {
                "groupName": "BlueColor",
                "colors": []
            };
            group.colors.push({
                "color": '#0000FF',
                "opacity": 1,
                "elementIds": isolatedEntities.filter(ie=>props.userConfig.blueSpaceIds.includes(ie._id)).reduce((acc,e) => acc.concat(e.modelViewerIds),[])
            });
            groups.push(group);
        }
        if(props.userConfig.greenSpaceIds){
            const group = {
                "groupName": "GreenColor",
                "colors": []
            };
            group.colors.push({
                "color": '#00FF00',
                "opacity": 1,
                "elementIds": isolatedEntities.filter(ie=>props.userConfig.greenSpaceIds.includes(ie._id)).reduce((acc,e) => acc.concat(e.modelViewerIds),[])
            });
            groups.push(group);
        }
        return groups
    },[isolatedEntities,props.userConfig.redSpaceIds,props.userConfig.blueSpaceIds,props.userConfig.greenSpaceIds]);


    const colorGroup2 = useMemo(() => {
        if(!props.userConfig.redSpaceIds && !props.userConfig.blueSpaceIds && !props.userConfig.greenSpaceIds){
            return undefined;
        }
        const group = {
            "groupName": "AllColors",
            "colors": []
        };
        if(props.userConfig.redSpaceIds){
            group.colors.push({
                "color": '#FF0000',
                "opacity": 1,
                "elementIds": isolatedEntities.filter(ie=>props.userConfig.redSpaceIds.includes(ie._id)).reduce((acc,e) => acc.concat(e.modelViewerIds),[])
            });
        }
        if(props.userConfig.blueSpaceIds){
            group.colors.push({
                "color": '#0000FF',
                "opacity": 1,
                "elementIds": isolatedEntities.filter(ie=>props.userConfig.blueSpaceIds.includes(ie._id)).reduce((acc,e) => acc.concat(e.modelViewerIds),[])
            });
        }
        if(props.userConfig.greenSpaceIds){
            group.colors.push({
                "color": '#00FF00',
                "opacity": 1,
                "elementIds": isolatedEntities.filter(ie=>props.userConfig.greenSpaceIds.includes(ie._id)).reduce((acc,e) => acc.concat(e.modelViewerIds),[])
            });
        }
        if(group.colors.length>0) {
            return [group]
        }
        return undefined
    },[isolatedEntities,props.userConfig.redSpaceIds,props.userConfig.blueSpaceIds,props.userConfig.greenSpaceIds]);

    return (
        <div className='navigator-view' style={{height: '900px'}}>
            <div className='navigator-viewer'>
                <EnhancedIafViewer
                    name={'NavigatorViewer'}
                    model={props.selectedItems.selectedModel}
                    viewerResizeCanvas={true}

                    isolatedEntities={isolatedEntities}
                    hiddenEntities={undefined}
                    selectedEntities={selectedEntities}

                    isolatedSpaces={isolatedSpaces}
                    isolatedRemainingEntities={isolatedRemainingEntities}
                    hiddenElementIds={EMPTY_ARRAY}
                    onSelect={handleModelIdsSelectionFromViewer}

                    colorGroups={colorGroup2}
                />
            </div>
        </div>
    );

}

DevsNavigatorView.contextTypes = {
    ifefPlatform: PropTypes.object,
    ifefSnapper: PropTypes.object,
    ifefNavDirection: PropTypes.string,
    ifefShowPopover: PropTypes.func,
    ifefUpdatePopover: PropTypes.func,
    ifefUpdatePopup: PropTypes.func,
    ifefShowModal: PropTypes.func
};

export default withEntityStore(withEntityConfig(DevsNavigatorView));


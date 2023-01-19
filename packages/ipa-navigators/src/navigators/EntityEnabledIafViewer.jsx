import React, {useState, useEffect, useRef, useMemo} from 'react';
import {compose} from "@reduxjs/toolkit";
import {connect} from "react-redux";

import _ from 'lodash'
import "@invicara/iaf-viewer/dist/iaf-viewer.css"

import {Entities} from "@invicara/ipa-core/modules/IpaRedux"
import {EnhancedIafViewer} from "./EnhancedIafViewer";
const {
    getCurrentEntityType,
    getIsolatedEntities,
    getSelectedEntities,
    isViewerSyncOn,
    selectEntitiesFromModels
} = Entities;

export const extractSpacesFromEntities = (entities) => {
    let isolatedSpaces = []
    let isolatedRemainingEntities = []

    entities.forEach(entity => {
        if(entity.hasOwnProperty(['Space Name'])) {
            isolatedSpaces.push(entity)
        } else {
            isolatedRemainingEntities.push(entity)
        }
    })

    return {isolatedSpaces, isolatedRemainingEntities}
}


const EntityEnabledIafViewer = ({isolatedEntities, selectedEntities, viewerSyncOn, selectEntitiesFromModels, contextProps}) => {

    const {isolatedSpaces, isolatedRemainingEntities} = useMemo(()=>extractSpacesFromEntities(isolatedEntities),[isolatedEntities]);

    const hiddenElementIds = useMemo(()=>[],[]);
    const isolatedElementIds = useMemo(()=>viewerSyncOn ? isolatedRemainingEntities.map(e => e.modelViewerIds[0]) : [],[isolatedRemainingEntities, viewerSyncOn]);
    const spaceElementIds = useMemo(()=>viewerSyncOn ? isolatedSpaces.map(e => e.modelViewerIds[0]) : [],[isolatedSpaces, viewerSyncOn]);
    const highlightedElementIds = useMemo(()=>viewerSyncOn ? selectedEntities.map(e => e.modelViewerIds[0]) : [],[selectedEntities, viewerSyncOn]);
    const onSelect = useMemo(()=>viewerSyncOn ? modelEntities => selectEntitiesFromModels(modelEntities) : _.noop,[viewerSyncOn]);

    return <EnhancedIafViewer model={contextProps.selectedItems.selectedModel}
                              viewerResizeCanvas={true}
                              isolatedElementIds={isolatedElementIds}
                              spaceElementIds={viewerSyncOn ? spaceElementIds : []}
                              highlightedElementIds={highlightedElementIds}
                              onSelect={onSelect}
                              hiddenElementIds={hiddenElementIds}
    />
}

const mapStateToProps = state => ({
    isolatedEntities: getIsolatedEntities(state),
    selectedEntities: getSelectedEntities(state),
    viewerSyncOn: isViewerSyncOn(state),
    currentEntityType: getCurrentEntityType(state),
});

const mapDispatchToProps = {
    selectEntitiesFromModels
}

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
)(EntityEnabledIafViewer)

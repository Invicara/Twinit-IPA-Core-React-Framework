import { createSlice } from '@reduxjs/toolkit'

import {EntityModalFactory} from "../../IpaPageComponents/entities/EntityModal";
import {EntityCollectionModalFactory} from "../../IpaPageComponents/entities/EntityCollectionModal";
import {EntityRelationsModalFactory} from "../../IpaPageComponents/entities/EntityRelationsModal";
import {RelationsModalFactory} from "../../IpaPageComponents/entities/RelationsModal";

const ENTITY_ACTION_COMPONENTS = {
  "EntityModal": EntityModalFactory,
  "RelationsModal": RelationsModalFactory,
  "EntityCollectionModal": EntityCollectionModalFactory,
  "EntityRelationsModal": EntityRelationsModalFactory
}

import {ImageFactory} from "../../IpaControls/Image";
import {ScriptedChartFactory} from "../../IpaControls/ScriptedChart";
import {SimpleTabbedTableFactory, SimpleTableFactory, SimpleTableGroupFactory} from "../../IpaControls/private/simple-table";
import {ScriptedDocumentTableFactory} from '../../IpaPageComponents/files/ScriptedDocumentTable';
import {StandaloneDocumentTableFactory} from '../../IpaPageComponents/files/StandaloneDocumentTable';


const ENTITY_DATA_COMPONENTS = {
  "SimpleTable": SimpleTableFactory,
  "ScriptedDocumentTable": ScriptedDocumentTableFactory,
  "StandaloneDocumentTable": StandaloneDocumentTableFactory,
  "SimpleTableGroup": SimpleTableGroupFactory,
  "SimpleTabbedTable": SimpleTabbedTableFactory,
  "Image": ImageFactory,
  "ScriptedChart": ScriptedChartFactory
}

let applicatonActionComponents = {}
const addApplicationActionComponent = component => applicatonActionComponents[component.name] = component.component
let applicatonDataComponents = {}
const addApplicationDataComponent = component => applicatonDataComponents[component.name] = component.component

let initialState = {
    frameworkActionComponents: Object.keys(ENTITY_ACTION_COMPONENTS),
    applicationActionComponents: [],
    frameworkDataComponents: Object.keys(ENTITY_DATA_COMPONENTS),
    applicationDataComponents: []
};

const entityUI = createSlice({
    name: 'entityUI',
    initialState,
    reducers: {
      setApplicationActionComponents: (state, {payload: entityActionComponents}) => {state.applicationActionComponents = entityActionComponents},
      setApplicationDataComponents: (state, {payload: entityDataComponents}) => {state.applicationDataComponents = entityDataComponents}
    }
});

const { actions, reducer } = entityUI
export default reducer

//Action creators
const { setApplicationActionComponents, setApplicationDataComponents } = actions
  
//Thunks
export const addEntityComponents = (componentType, components) => (dispatch, getState) => {
  
  if (componentType === 'action') {
    
    components.forEach((comp) => {
      addApplicationActionComponent(comp)
    })
    
    let newActionComponents = Object.keys(applicatonActionComponents)
    dispatch(setApplicationActionComponents(newActionComponents))
    
  }else if (componentType === 'data') {
    
    components.forEach((comp) => {
      addApplicationDataComponent(comp)
    })
    
    let entityDataComponents = Object.keys(applicatonDataComponents)
    dispatch(setApplicationDataComponents(entityDataComponents))
    
  } else {
    console.error("Incorrect Entity Component UI type")
  }
}

export const getEntityActionComponent = (componentName) => (dispatch, getState) => {
  
  let component = null
  component = applicatonActionComponents[componentName]
  if (!component) component = ENTITY_ACTION_COMPONENTS[componentName]
  
  return component
  
}

export const getEntityDataComponent = (componentName) => (dispatch, getState) => {
  
  let component = null
  component = applicatonDataComponents[componentName]
  if (!component) component = ENTITY_DATA_COMPONENTS[componentName]
  return component
  
}
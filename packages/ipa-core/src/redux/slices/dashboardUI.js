import { createSlice } from '@reduxjs/toolkit'

import ChartTestPage from "../../IpaPageComponents/dashboards/ChartTestPage"
import ChartStack from "../../IpaControls/ChartStack"
import BigButtonBar from "../../IpaControls/BigButtonBar"
import CompactButtonBar from "../../IpaControls/CompactButtonBar"
import Image from "../../IpaControls/Image"
import CrossEntitySearch from "../../IpaControls/CrossEntitySearch";
import GenericIframe from "../../IpaControls/GenericIframe";
import ScriptedAlertTable from '../../IpaControls/AlertTable/ScriptedAlertTable'
import ScriptedDocumentTable from "../../IpaPageComponents/files/ScriptedDocumentTable";

const DASHBOARD_COMPONENTS = {
  "ChartTestPage": ChartTestPage,
  "ChartStack": ChartStack,
  "BigButtonBar": BigButtonBar,
  "CompactButtonBar": CompactButtonBar,
  "CrossEntitySearch": CrossEntitySearch,
  "Image": Image,
  "Iframe": GenericIframe,
  "ScriptedAlertTable": ScriptedAlertTable,
  "ScriptedDocumentTable": ScriptedDocumentTable
}

let applicatonDashboardComponents = {}
const addApplicationDashboardComponent = component => applicatonDashboardComponents[component.name] = component.component

let initialState = {
    frameworkComponents: Object.keys(DASHBOARD_COMPONENTS),
    applicationComponents: []
};

const dashboardsSlice = createSlice({
    name: 'dashboardsUI',
    initialState,
    reducers: {
      setApplicationComponents: (state, {payload: dashboardComponents}) => {state.applicationComponents = dashboardComponents}
    }
});

const { actions, reducer } = dashboardsSlice
export default reducer

//Action creators
const { setApplicationComponents } = actions
  
//Thunks
export const addDashboardComponents = (components) => (dispatch, getState) => {
  
  components.forEach((comp) => {
    addApplicationDashboardComponent(comp)
  })
  
  let dashboardComponents = Object.keys(applicatonDashboardComponents)
  dispatch(setApplicationComponents(dashboardComponents))
  
}

export const getDashboardComponent = (componentName) => (dispatch, getState) => {

  let component = null
  component = applicatonDashboardComponents[componentName]
  if (!component) component = DASHBOARD_COMPONENTS[componentName]
  
  return component
  
}
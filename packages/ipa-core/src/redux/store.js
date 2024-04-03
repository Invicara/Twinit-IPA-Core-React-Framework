import entitiesGeneral from './slices/entities'
import entitiesPluggableSearch from './slices/entities-pluggable-search'
import entityRelations from './slices/entity-relations'
import userConfig from './slices/user-config'
import user from './slices/user'
import files from './slices/files'
import dashboardUI from './slices/dashboardUI'
import entityUI from './slices/entityUI'
import modal from './slices/modal'
import {
    NAMED_USER_ITEM_FEATURE_KEY, namedUserItemReducer
} from './slices/named-user-item.slice'

import {combineReducers} from "redux"

import {configureStore, getDefaultMiddleware} from "@reduxjs/toolkit";

const frameworkReducers = {
  entitiesGeneral, entitiesPluggableSearch, entityRelations, entityUI, userConfig, user, files, dashboardUI, modal, [NAMED_USER_ITEM_FEATURE_KEY] : namedUserItemReducer
}

let appReducers = {}

const combinedReducers = combineReducers({...frameworkReducers, ...appReducers})

export const addReducerSlice = (addSlice) => {
  
  appReducers[addSlice.name] = addSlice.slice
  
  return combineReducers({
    ...frameworkReducers,
    ...appReducers
  })
}

const rootReducer = (state, action) => {
  if (action.type === "Project_SWITCHED")
    state = undefined

  return combinedReducers(state, action)
}

export default configureStore({
    reducer: rootReducer,
    middleware: [...getDefaultMiddleware()],
    devTools: process.env.NODE_ENV !== 'production',
})



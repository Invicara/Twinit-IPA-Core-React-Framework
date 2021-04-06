import { createSelector, createSlice} from '@reduxjs/toolkit'
import EmptyConfig from '../../emptyConfig';


let initialState = EmptyConfig;

const userConfigSlice = createSlice({
    name: 'userConfig',
    initialState,
    reducers: {
        setUserConfig: (state, { payload: config }) => config,
    },
});

const { actions, reducer } = userConfigSlice
export default reducer

//Private selectors
const getUserConfigSlice = store => store.userConfig;

//Public selectors

export const getEntitySelectConfig = createSelector(getUserConfigSlice,
    config =>         
        (Object.entries(config.handlers).filter( e => e[1].config && e[1].config.entityData && Object.entries(e[1].config.entityData).length === 1).map( e=> ({entityName:  Object.keys(e[1].config.entityData)[0], entityPluralName: e[1].config.type.plural, script: e[1].config.entityData[Object.keys(e[1].config.entityData)[0]].script, selectors: config.entitySelectConfig[Object.keys(e[1].config.entityData)[0]]})))
);

//Action creators
export const {
    setUserConfig
} = actions;

//TODO This thunk doesn't seem to really make sense
//Thunks
export const addUserConfig = (config) => (dispatch, getState) => {
  
  dispatch(setUserConfig(config))

}

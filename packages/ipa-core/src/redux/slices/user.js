import { createSelector, createSlice} from '@reduxjs/toolkit'


let initialState = {
  _firstname: "Unknown",
  _lastname: "User",
  _email: "UnknownUser"
};
import ScriptHelper from "../../IpaUtils/ScriptHelper";

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, { payload: user }) => user,
    },
});

const { actions, reducer } = userSlice
export default reducer

export const getUser = store => store.user;

//Action creators
export const {
    setUser
} = actions;

//TODO This thunk doesn't seem to really make sense
//Thunks
export const addUser = (user) => (dispatch, getState) => {
  
  dispatch(setUser(user))

}
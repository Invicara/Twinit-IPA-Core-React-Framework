import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    component: undefined,
    props: undefined,
    open: false,
}


const slice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        setModal: (state, {payload: {component, props, open}}) => {
            state.component = component
            state.props = props
            if(_.isBoolean(open)) {
                state.open = open
            }
        },
        setOpen: (state, {payload}) => {
            state.open = payload;
        },
        destroy: (state) => {
            state.component = initialState.component;
            state.props = initialState.props;
            state.open = initialState.open;
        },
    }
})


export default slice.reducer;

export const actions = slice.actions;
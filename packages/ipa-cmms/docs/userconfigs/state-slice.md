---
title: How to load your own state slice
sidebar_position: 800
---

When loading your own state slice into ipa-cmms, the slice file must be added into the following location: `packages/ipa-cmms/src/redux/slices`

We will use an example of the Modal slice to illustrate how to configure a state slice in Redux.

This file was added into `packages/ipa-cmms/src/redux/slices`
```jsx 
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
```

We then must add this to our `main.js` file located at:`packages/ipa-cmms/src/redux`

```jsx
import * as modal from './slices/modal'

const redux = {
   ...
    Modals: {
        ...modal.actions
    }
}

export default redux
```

We also add to add it to our frameworkReducers object in `store.js` located at: `packages/ipa-cmms/src/redux`

```jsx
import modal from './slices/modal'

const frameworkReducers = {
    ...
    modal
}
```
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import {IafItemSvc} from "@invicara/platform-api";
export const NAMED_USER_ITEM_FEATURE_KEY = 'namedUserItem';
export const namedUserItemAdapter = createEntityAdapter({
  //IDs are stored in a customized field ("_id")
  selectId: (namedUserItem) => namedUserItem._id,
  // Keep the "all IDs" array sorted based on names
  sortComparer: (a, b) => a._name.localeCompare(b._name),
});
/**
 * Export an effect using createAsyncThunk from
 * the Redux Toolkit: https://redux-toolkit.js.org/api/createAsyncThunk
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(fetchNamedUserItem())
 * }, [dispatch]);
 * ```
 */
export const fetchNamedUserItem = createAsyncThunk(
  'namedUserItem/fetchStatus',
  async (_, thunkAPI) => {
    //TODO: implement this
    return Promise.resolve([]);
  }
);
export const fetchNamedUserItems = createAsyncThunk(
    'namedUserItems/fetchStatus',
    async (args, thunkAPI) => {
      /**
       * @param {criteria: NamedUserItemCriteria, ctx: Ctx, options: NamedUserItemCriteriaOptions} - args
       * @returns {Promise<Page<NamedUserItem>>}
       *
       * @see https://twinit.dev/docs/apis/javascript/types#nameduseritemcriteria
       *
       */
          //TODO: for the moment we fetch all user types
      const criteria = {query: {}};
      return IafItemSvc.getNamedUserItems(criteria, args.ctx, args.options);
    }
);
export const fetchAllNamedUserItems = createAsyncThunk(
    'allNamedUserItems/fetchStatus',
    async (args, thunkAPI) => {
      /**
       * @param {criteria: NamedUserItemCriteria, ctx: Ctx, options: NamedUserItemCriteriaOptions} - args
       * @returns {Promise<Array<NamedUserItem>>}
       */
      //TODO: for the moment we fetch all user types
      const criteria = args.criteria || {query: {}};
      const ctx = args.ctx || {};
      const options = args.options;
      return IafItemSvc.getAllNamedUserItems(criteria, ctx, options);
    }
);
export const initialNamedUserItemState = namedUserItemAdapter.getInitialState({
  //TODO: do we need to have separate loading/error statuses per thunk?
  loadingStatus: 'not loaded',
  error: null,
});
export const namedUserItemSlice = createSlice({
  name: NAMED_USER_ITEM_FEATURE_KEY,
  initialState: initialNamedUserItemState,
  reducers: {
    add: namedUserItemAdapter.addOne,
    remove: namedUserItemAdapter.removeOne,
    setAll: namedUserItemAdapter.setAll
    // ...
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNamedUserItem.pending, (state) => {
        state.loadingStatus = 'loading';
      })
      .addCase(fetchAllNamedUserItems.pending, (state) => {
        state.loadingStatus = 'loading';
      })
      .addCase(fetchNamedUserItem.fulfilled, (state, action) => {
        namedUserItemAdapter.addOne(state, action.payload);
        state.loadingStatus = 'loaded';
      })
      .addCase(fetchAllNamedUserItems.fulfilled, (state, action) => {
        namedUserItemAdapter.setAll(state, action.payload);
        state.loadingStatus = 'loaded';
      })
      .addCase(fetchNamedUserItem.rejected, (state, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(fetchAllNamedUserItems.rejected, (state, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      });;
  },
});
/*
 * Export reducer for store configuration.
 */
export const namedUserItemReducer = namedUserItemSlice.reducer;
/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(namedUserItemActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const namedUserItemActions = namedUserItemSlice.actions;
/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllNamedUserItem);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities, selectById } = namedUserItemAdapter.getSelectors();
export const getNamedUserItemSlice = (rootState) => rootState[NAMED_USER_ITEM_FEATURE_KEY];
const getLoadingStatus = (slice) => slice.loadingStatus;

export const selectNamedUserItemById = createSelector(
    getNamedUserItemSlice,
    (state,id)=>id,
    selectById
);
export const selectAllNamedUserItem = createSelector(
    getNamedUserItemSlice,
    selectAll
);
export const selectNamedUserItemEntities = createSelector(
    getNamedUserItemSlice,
    selectEntities
);
export const selectNamedUserItemsLoadingStatus = createSelector(
    getNamedUserItemSlice,
    getLoadingStatus
);

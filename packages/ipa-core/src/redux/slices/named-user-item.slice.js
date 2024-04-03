import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import {IafItemSvc, IafFileSvc} from "@invicara/platform-api";
import {IafScriptEngine} from '@invicara/iaf-script-engine';
import ScriptHelper from '../../IpaUtils/ScriptHelper';
import _ from 'lodash';

export const NAMED_USER_ITEM_FEATURE_KEY = 'namedUserItem';
export const namedUserItemAdapter = createEntityAdapter({
  //IDs are stored in a customized field ("_id")
  selectId: (namedUserItem) => namedUserItem._id,
  // Keep the "all IDs" array sorted based on names
  sortComparer: (a, b) => a._name.localeCompare(b._name),
});

export const fetchNamedUserItemItems = createAsyncThunk( 
  'namedUserItem/fetchStatus',
  async (args, thunkAPI) => {
      const {scriptName, userItemId, userItemVersionId, ctx} = args

      if (!scriptName) { 
        return IafScriptEngine.getItems({
            query: {},
            _userItemId: userItemId,
            options: {
                "page": {
                    "_pageSize": 5,
                    "_offset":0,
                    "getPageInfo": true
                },
                //userItemVersionId: model_rel_coll_prev._userItemVersionId
            }
        }, ctx)
    } else{
      return ScriptHelper.executeScript(scriptName, userItemId)
    };
  }
);

export const fetchNamedUserTotalAmountOfItems = createAsyncThunk( 
  'namedUserItemTotalItems/fetchStatus',
  async (args, thunkAPI) => {
    const {collectionsArray, ctx} = args
    const resultArr = collectionsArray.map((item) => {
      return {
        query: {},
        _userItemId: item._userItemId,
        options: {
          "page": {
            "getPageInfo": true
          },
        }
      }
    })
    return IafScriptEngine.getItemsMulti(resultArr, ctx);   
  }
);

let collectionIndexes = []
export const fetchAssocitedFileSvcData = createAsyncThunk( 
  'namedUserItemFileSvcData/fetchStatus',
  async (args, thunkAPI) => {
      const {fileItems, idx, ctx} = args 
      let fileSvcRes
      for(let i = 0; i < fileItems.length; i++){
        if(!fileItems[i]._fileId) { 
            const criteria = {"_name" :fileItems[i].filename || fileItems[i].name}
            fileSvcRes = await IafFileSvc.getFiles(criteria, ctx);
          }
        if (collectionIndexes.includes(idx)) break;
        if(fileSvcRes) collectionIndexes.push(idx)
      }
    return collectionIndexes;
  }
);

export const fetchAllNamedUserItems = createAsyncThunk(
    'allNamedUserItems/fetchStatus',
    async (args, thunkAPI) => {
      const {scriptName} = args
      
      if(!scriptName) { 
        const criteria = {query : {"_itemClass": {"$in": ["NamedUserCollection","NamedFileCollection"]}}};
        const ctx = {...args.ctx} || {};
        const options = args.options;
        return IafItemSvc.getAllNamedUserItems(criteria, ctx, options);
      } else {
        return await ScriptHelper.executeScript(scriptName)
      }
  }
);

export const fileImport = createAsyncThunk(
  'importData/importStatus',
  async (args, thunkAPI) => {
    const {importScriptName} = args
    return ScriptHelper.executeScript(importScriptName) 
  }
);

export const importDataValidation = createAsyncThunk(
  'importData/ValidationStatus',
  async (args, thunkAPI) => {
    const {valScriptName, importFileResult} = args
    return await ScriptHelper.executeScript(valScriptName, {thunkAPI, importFileResult})
  }
);

export const initialNamedUserItemState = namedUserItemAdapter.getInitialState({
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
      .addCase(fetchNamedUserItemItems.pending, (state) => {
        state.loadingStatus = 'loading';
      })
      .addCase(fetchAllNamedUserItems.pending, (state) => {
        state.loadingStatus = 'loading';
      })
      .addCase(fetchNamedUserTotalAmountOfItems.pending, (state) => {
        state.loadingStatus = 'loading';
      })
      .addCase(fetchAssocitedFileSvcData.pending, (state) => {
        state.loadingStatus = 'loading';
      })
      .addCase(importDataValidation.pending, (state) => {
        state.loadingStatus = 'loading';
      })
      .addCase(fileImport.pending, (state) => {
        state.loadingStatus = 'loading';
      })
      .addCase(fetchNamedUserItemItems.fulfilled, (state, action) => { 
        namedUserItemAdapter.updateOne(state, action.payload); 
        state.loadingStatus = 'loaded';
      })
      .addCase(fetchAllNamedUserItems.fulfilled, (state, action) => {
        namedUserItemAdapter.setAll(state, action.payload._list);
        state.loadingStatus = 'loaded';
      })
      .addCase(fetchNamedUserTotalAmountOfItems.fulfilled, (state, action) => { 
        namedUserItemAdapter.updateOne(state, action.payload); 
        state.loadingStatus = 'loaded';
      })
      .addCase(fetchAssocitedFileSvcData.fulfilled, (state, action) => { 
        namedUserItemAdapter.updateOne(state, action.payload); 
        state.loadingStatus = 'loaded';
      })
      .addCase(importDataValidation.fulfilled, (state, action) => { 
        namedUserItemAdapter.updateOne(state, action.payload); 
        state.loadingStatus = 'loaded';
        state.error = null;
      })
      .addCase(fileImport.fulfilled, (state, action) => { 
        namedUserItemAdapter.updateOne(state, action.payload); 
        state.loadingStatus = 'loaded';
        state.error = null;
      })
      .addCase(fetchNamedUserItemItems.rejected, (state, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(fetchAllNamedUserItems.rejected, (state, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(fetchNamedUserTotalAmountOfItems.rejected, (state, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(fetchAssocitedFileSvcData.rejected, (state, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      })
      .addCase(importDataValidation.rejected, (state, action) => {
        state.loadingStatus = 'error';
        state.error = action.payload;
      })
      .addCase(fileImport.rejected, (state, action) => {
        state.loadingStatus = 'error';
        state.error = action.payload;
      });
  },
});
/*
 * Export reducer for store configuration.
 */
export const namedUserItemReducer = namedUserItemSlice.reducer;

export const namedUserItemActions = namedUserItemSlice.actions;
 
const { selectAll, selectEntities, selectById } = namedUserItemAdapter.getSelectors();
export const getNamedUserItemSlice = (rootState) => rootState[NAMED_USER_ITEM_FEATURE_KEY];
const getLoadingStatus = (slice) => slice.loadingStatus;
const getErrorStatus = (slice) => slice.error;

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
    getLoadingStatus,
);
export const SelectNamedUserItemsErrorStatus = createSelector(
  getNamedUserItemSlice,
  getErrorStatus
);
export const SelectNamedUserItemsImportStatus = createSelector(
  getNamedUserItemSlice,
  getLoadingStatus
);
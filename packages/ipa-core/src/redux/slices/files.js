import { createSelector, createSlice} from '@reduxjs/toolkit'
import {IafFile} from "@invicara/platform-api";
import produce from "immer";
import FileConfigReader from "../../IpaPageComponents/files/configReader";
import _ from 'lodash'

import ScriptHelper from "../../IpaUtils/ScriptHelper";


//Small ADT to keep File blob objects outside the store since they're not serializable
let fileBlobs = {}
const addFileBlob  = fileBlob => fileBlobs[fileBlob.name] = fileBlob;
const clearFileBlobs  = () => fileBlobs = {};

let columnConfig = {};

export const FileStatus = {
    PENDING:'Pending',
    PROGRESS: 'In progress',
    COMPLETE: 'Complete',
    ERROR: 'Error'
};

const buildFile = (blob, overrideName, initialAttributes = {}, attributeKeys = ['manufacturer', ['dtType', 'dtCategory']]) => {
    addFileBlob(blob)
    const fileAttributes = _.fromPairs(attributeKeys.map(attrKey => {
        if(typeof attrKey === 'string'){
            return [attrKey, _.isEmpty(initialAttributes[attrKey]) ? '' : initialAttributes[attrKey]]
        } else if(Array.isArray(attrKey)){
            const complexValue = _.toPairs(initialAttributes)
                .filter(([attrName, attrValue]) => _.includes(attrKey, attrName))
                .map(([attrName, attrValue]) => attrValue)
            return [attrKey, _.isEmpty(complexValue) ? attrKey.map(()=>'') : complexValue];
        } else {
            throw new Error('Invalid attribute key, must be either a string or an array of strings:', attrKey)
        }
    }))
    return {
        status: FileStatus.PENDING,
        name: overrideName ? overrideName : blob.name,
        originalName: blob.name,
        version: 1, //Optimistically populate version
        bytesUploaded: 0,
        fileAttributes,
    }
};

export const getBlob = (file) => fileBlobs[file.originalName]

let initialState = {
    columnConfig: [],
    toUpload: [],
    associatedEntities: [],
    rejected: []
};

const entitiesSlice = createSlice({
    name: 'files',
    initialState,
    reducers: {
        addFiles: (state, { payload: newFiles }) => {
            state.toUpload = state.toUpload.concat(newFiles)
        },
        updateFile: (state, { payload: {name,...updates} }) => {
            const toUpdate = state.toUpload.find(f => f.name === name) //TODO if this gets too slow, use direct access instead of an array
            _.assign(toUpdate, updates)
        },
        updateFileName: (state, { payload: {name, newName} }) => {
            const toUpdate = state.toUpload.find(f => f.name === name) //TODO if this gets too slow, use direct access instead of an array
            _.assign(toUpdate, {name: newName})
        },
        updateFileAttribute: (state, { payload: {name,...updates}}) => {
            const toUpdate = state.toUpload.find(f => f.name === name) //TODO if this gets too slow, use direct access instead of an array
            toUpdate.fileAttributes = _.assign(toUpdate.fileAttributes, updates)
        },
        removeAllFiles: (state) => {
            state.toUpload = []
        },
        setAssociatedEntities: (state, { payload: {entities, entityType} }) => {
            state.associatedEntities = entities.map(produce(e => {e.entityType = entityType}))
        },
        setRejectedFiles: (state, { payload: rejectedFiles }) => {
            state.rejected = rejectedFiles
        },
        setColumnConfig: (state, { payload: config }) => {
            state.columnConfig = config
        },
    },
});

const { actions, reducer } = entitiesSlice
export default reducer

//Selectors

const getFilesSlice = store => store.files

export const getFilesToUpload = createSelector(getFilesSlice, filesSlice =>
    filesSlice.toUpload.map(f => ({...f, fileBlob: getBlob(f)}))
);

export const getAssociatedEntities = createSelector(getFilesSlice, filesSlice => filesSlice.associatedEntities);

export const getRejectedFiles = createSelector(getFilesSlice, filesSlice => filesSlice.rejected);

export const getColumnConfig = createSelector(getFilesSlice, filesSlice => filesSlice.columnConfig.map(name => columnConfig[name]));

export const getFilesMetadata = createSelector(getFilesSlice, filesSlice => filesSlice.toUpload);

//Action creators
export const { addFiles, removeAllFiles, updateFile, updateFileName, setAssociatedEntities, updateFileAttribute, setRejectedFiles, setColumnConfig } = actions;

//Thunks
export const fetchColumnConfig = (config) => async dispatch => {
    const displayNames = await ScriptHelper.getScriptVar("iaf_attributeDisplayNames");
    const columnValues = await Promise.all(config.columns.map(FileConfigReader.buildConfig(displayNames)))
    columnConfig = columnValues.reduce((cols, col) => ({...cols, [col.name]: col}),{})
    dispatch(setColumnConfig(columnValues.map(({name}) => name)))
};

export const addFilesToUpload = (newFileBlobs, container, preProcessScript) => async (dispatch, getState) => {
    const {accepted, rejected} = await preProcess(newFileBlobs, preProcessScript)
    const columnNames = getColumnConfig(getState()).map(({name}) => name);
    const files = accepted.map(acc => buildFile(newFileBlobs.find(b => b.name === acc.name), acc.overrideName, acc.fileAttributes, columnNames));
    dispatch(setRejectedFiles(rejected.map(f => ({name: f.name}))));
    await dispatch(addFiles(files));
    const fileVersions = await Promise.all(files.map(withVersion(container)))
    fileVersions.forEach(fv => dispatch(updateFile(fv)));
};

export const cleanFiles = () => async dispatch => {
    clearFileBlobs();
    dispatch(removeAllFiles())
};

export const updateMultipleFileAttribute = (fileUpdates) => async (dispatch) => {
    fileUpdates.forEach(fu => dispatch(updateFileAttribute(fu)))
}

export const uploadFiles = (container, processUploadScript, postProcessScript, batchSize = 5) => async (dispatch, getState) => {
    const batches = _.chunk(getFilesMetadata(getState()), batchSize);
    for(let batch of batches){
        await dispatch(uploadFileBatch(container, batch, processUploadScript))
    }
    if(postProcessScript) dispatch(postProcessFiles(postProcessScript))
}

export const uploadFileBatch = (container, batch, processUploadScript) => async dispatch => {
    const refreshBytes = file => bytes => dispatch(updateFile({name: file.name, bytesUploaded: bytes}))

    return Promise.all(batch.map(async file => {

      //allow the processUploadScript one last chance to modify the file name
      let overrideName = null;
      if (processUploadScript) {
        overrideName = await ScriptHelper.executeScript(processUploadScript, {file: file});
        if (overrideName) {
          dispatch(updateFileName({name: file.name, newName: overrideName}));
          file = produce(file, file => {
            file.name = overrideName;
          });
        }
      }

      dispatch(updateFile({name: file.name, status: FileStatus.PROGRESS}))

      try{
          const uploaded = await uploadFile(container, file,refreshBytes(file), processUploadScript);
          dispatch(updateFile({name: file.name, status: FileStatus.COMPLETE, uploadResult: uploaded}))
      } catch {
          dispatch(updateFile({name: file.name, status: FileStatus.ERROR}))
      }
    }))
};

export const loadAssociatedEntities = ({selectedEntities, script, entityType}) => async dispatch => {
    if (selectedEntities) {
        const query = {_id: {$in: selectedEntities}};
        const entities = await ScriptHelper.executeScript(script, {entityInfo: query})
        dispatch(setAssociatedEntities({entities, entityType}))
    } else {
        dispatch(setAssociatedEntities({entities:[]}))
    }
};

export const postProcessFiles = (postProcessScript) => async (dispatch, getState) => {
    const entitiesByType = _.groupBy(getAssociatedEntities(getState()), ({entityType}) => entityType);
    _.keys(entitiesByType).forEach(entityType => ScriptHelper.executeScript(postProcessScript, {
        entityType,
        entities: entitiesByType[entityType] || [],
        fileItems: getFilesToUpload(getState()).map(({uploadResult}) => uploadResult)}
    ));
}

//Other
const withVersion = container => async file => {
    const existingCheck = await IafFile.getFileItems(container, {name: file.name}, null, null, null);
    const version = !!existingCheck && existingCheck._list.length > 0 ?
        existingCheck._list[0].tipVersionNumber : 1;
    return {name: file.name, version}
}

const uploadFile = (container, file, refreshBytes) => new Promise((resolve, reject) => {
    const newFile = new File([getBlob(file)], file.name, {type:getBlob(file).type})
    newFile.fileItem = {
      fileAttributes: _.fromPairs(_.toPairs(file.fileAttributes).flatMap(([attrName, attrValue]) =>
        comesFromComplexSelect(attrValue) ? asValuePair(attrName, attrValue) : [[attrName, attrValue]]
      ))
    }
    IafFile.uploadFileResumable(container, newFile, {
      filename: file.name,
      onComplete: resolve,
      onError: reject,
      onProgress: refreshBytes
    })
  })

//We always take the first value bc we are not allowing multi-selects for file upload. See configReader for validation.
const asValuePair = (attrName, attrValue) => {
    const selectValues = _.values(attrValue);
    const attrNames = attrName.split(',') //Turn to array again
    return  _.values(attrValue).map((selectValue, i) => [(attrNames[i]), selectValue[0]])
}

const preProcess = async (files, script) => {
    if(script){
        const result = await ScriptHelper.executeScript(script, {files: files})
        return {
            accepted: (result.accepted || []).map(file => ({..._.omit(file, 'fileItem'), fileAttributes: file.fileItem.fileAttributes})),
            rejected: result.rejected || []
        }
    } else {
        return {accepted: files}
    }
}

export const isComplete = file => file.status === FileStatus.COMPLETE;
export const isReadyFor = columns => file => columns.filter(col => col.required).every(col => col.isCompositeAttribute ?
        col.name.every(name => !_.isEmpty(_.get(file.fileAttributes, `${col.name}.${name}`)))
        : !!_.get(file.fileAttributes, col.name)
);
export const isPending = file => file.status === FileStatus.PENDING;
export const isInProgress = file => file.status === FileStatus.PROGRESS;
export const comesFromComplexSelect = (attrValue) => typeof attrValue === "object";


import React, {useEffect, useState} from "react";

import {compose} from "redux";
import {connect} from "react-redux";
import {
    addFilesToUpload,
    cleanFiles, fetchColumnConfig, getAssociatedEntities, getColumnConfig,
    getFilesToUpload, getRejectedFiles,
    setRejectedFiles,
    isComplete, isReadyFor,
    loadAssociatedEntities, updateMultipleFileAttribute, updateMultipleFileAttributeAndVersion,
    uploadFiles, removeAllFiles
} from "../../redux/slices/files";
import {UploadFilesWizardSteps} from "./UploadWizardSteps";
import {SeedAttributes} from "./SeedAttributes";
import {FileTable, getValue} from "./FilesTable";
import {FileUploadTable} from "./FilesUploadTable";
import {WizardButtons} from "./misc";
import _ from 'lodash'

import ScriptHelper from "../../IpaUtils/ScriptHelper";
import './UploadFilesWizard.scss'
import {fetchLinkedSelectValues} from './LinkedSelectValues'

const UploadFilesWizard = ({queryParams, loadAssociatedEntities, onLoadComplete, handler: {config}, cleanFiles, files, rejectedFiles,
                               addFilesToUpload, selectedItems, updateMultipleFileAttribute, updateMultipleFileAttributeAndVersion, uploadFiles, associatedEntities, columnConfig, fetchColumnConfig, setRejectedFiles, removeAllFiles}) => {

    const [selectedStep, setSelectedStep] = useState(1);
    const [uploadContainer, setUploadContainer] = useState(selectedItems.selectedProject.rootContainer)
    const [isloading, setIsLoading] = useState(false)

    useEffect(() => {

        async function getUploadContainer() {
            let newContainer = await ScriptHelper.executeScript(config.uploadContainer.script, {containerDesc: config.uploadContainer.containerDesc})
            console.log(newContainer)
            if (newContainer) setUploadContainer(newContainer)
        }

        onLoadComplete();
        cleanFiles()
        if (config.uploadContainer) getUploadContainer()
    }, []);
    useEffect(() => {fetchColumnConfig(config)}, [config])
    useEffect(() => {
        loadAssociatedEntities(queryParams)
    }, [queryParams])

    const addFiles = newFiles => {
        setIsLoading(true)
        setSelectedStep(2)
        removeAllFiles()
        const fileRes = fileChecker(files, [...newFiles])
        addFilesToUpload([...fileRes], uploadContainer, config.scripts.preprocessFiles)
    }

    const cancel = () => {
        cleanFiles();
        setSelectedStep(1)
    };
    const removeRejectedFiles = () => setRejectedFiles([])

    const startUpload = () => {
        setSelectedStep(3);
        uploadFiles(uploadContainer, config.scripts.processUploadFile, config.scripts.postprocessFiles, 5, config.scripts.getFileContainer)
    }

    const handleFileChange = config.readonly ? _.noop : (files, field, newValue) => {
        const normalizedField = Array.isArray(field) ? field.join(',') : field;
        const fieldCandidates = Array.isArray(field) ? [normalizedField, ...field] : [normalizedField];
        
        // Check if this attribute affects container resolution
        const containerAffectingAttributes = config.containerAffectingAttributes || [];
        
        const affectsContainer = containerAffectingAttributes && containerAffectingAttributes.length > 0 &&
                                 containerAffectingAttributes.some(attr => fieldCandidates.includes(attr));
                                 
        const shouldRecomputeVersion = !!config.enableDynamicVersioning &&
                                       !!config.scripts?.getFileContainer &&
                                       affectsContainer;
        
        if (shouldRecomputeVersion) {
            // Only recompute version for attributes that affect container resolution
            updateMultipleFileAttributeAndVersion(
                files.map(file =>({name: file.name, [normalizedField]: newValue})),
                uploadContainer,
                config.scripts.getFileContainer
            );
        } else {
            // Use existing behavior for attributes that don't affect container
            updateMultipleFileAttribute(
                files.map(file =>({name: file.name, [normalizedField]: newValue}))
            );
        }
    };

    const buildReport = () => {
        const headers = ['Name', ...columnConfig.map(col => `${col.displayAs}${col.required ? '*' : ''}`)];
        const rows = files.map(file =>
            [file.name, ...columnConfig.map(col => getValue(file.fileAttributes[col.name]))]
        );
        ScriptHelper.executeScript(config.scripts.downloadReport, {tableRows: [headers, ...rows]})
    }
    
    const seedAttributes = async () => {
        return ScriptHelper.executeScript(config.scripts.seedAttributes)
    }

    function fileChecker(files, newFiles) {
        // This will remove any duplicate files if they are uploaded at once
        const seenFileNames = new Set();
        const newFilesArr = newFiles.filter(file => {
            if (seenFileNames.has(file.name)) {
                return false;
            } else {
                seenFileNames.add(file.name);
                return true;
            }
        });

        // This is to check if the same file is already in the File Table
        if(files.length >= 1) {
            const combinedArray = [...files, ...newFilesArr];
            const seen = new Set();
            const filteredFiles = combinedArray.filter(file => {
              if (seen.has(file.name)) {
                return false;
              }
              seen.add(file.name);
              return true;
            });
            return filteredFiles;
        } else {
            return newFilesArr
        }
      }

    const [LinkedSelectValues, setLinkedSelectValues] = useState()

    useEffect(() => {
        config.columns.map(async(col) => {
            if(col.name.includes('dtCategory')) {
                let valueRes = await fetchLinkedSelectValues(handleFileChange)
                setLinkedSelectValues(valueRes)
            }
        })
    },[])

    const steps = [
        {name: 'Add Files', component: config.scripts.seedAttributes ? <SeedAttributes onClick={seedAttributes} /> : <div/>},
        {
            name: 'Enter Required Data',
            component: columnConfig ?
                <FileTable columns={columnConfig} files={files} onFileChange={handleFileChange} setIsLoading={setIsLoading} LinkedSelectValues={LinkedSelectValues}/> : 'Loading...',
            buttons: WizardButtons({
                primaryContent: <span className={'button-content'}><i className="fas fa-upload"/>Upload</span>,
                secondaryContent: 'Cancel',
                primaryDisabled: !files.every(isReadyFor(columnConfig)),
                onPrimaryClick: startUpload,
                onSecondaryClick: cancel
            })
        },
        {
            name: 'Uploading',
            component: <FileUploadTable files={files}/>,
            buttons: WizardButtons({
                primaryContent: files.every(isComplete) ?
                    <span className={'button-content'}>Next<i className="fas fa-angle-right"/></span> :
                    <span className={'button-content'}><i className="fas fa-sync"/>Uploading</span>,
                primaryDisabled: !files.every(isComplete),
                onPrimaryClick: () => setSelectedStep(4),
                hideSecondary: true
            })
        },
        {
            name: 'Review',
            component: columnConfig ?
                <FileTable columns={columnConfig} files={files} onFileChange={handleFileChange}
                           readonly/> : 'Loading...',
            buttons: WizardButtons({
                primaryContent: <span className={'button-content'}>Upload again<i className="fas fa-angle-right"/></span>,
                onPrimaryClick: cancel,
                secondaryContent: 'Report',
                hideSecondary: !config.scripts.downloadReport,
                onSecondaryClick: buildReport
            })
        },
    ]

    return <UploadFilesWizardSteps steps={steps} selectedStep={selectedStep} associatedEntities={associatedEntities}
                                   addFiles={addFiles} cancel={cancel} startUpload={startUpload} rejectedFiles={rejectedFiles}
                                   uploadIconName={config?.uploadIconName}
                                   removeRejectedFiles={removeRejectedFiles}
                                   hideDefaultError={config.hideDefaultRejectedError}
                                   isloading={isloading}
    />
}

const mapStateToProps = state => ({
    files: getFilesToUpload(state),
    associatedEntities: getAssociatedEntities(state),
    rejectedFiles: getRejectedFiles(state),
    columnConfig: getColumnConfig(state)
});

const mapDispatchToProps = {
    addFilesToUpload, cleanFiles, uploadFiles, loadAssociatedEntities, updateMultipleFileAttribute, updateMultipleFileAttributeAndVersion, fetchColumnConfig, setRejectedFiles, removeAllFiles
}

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
)(UploadFilesWizard)


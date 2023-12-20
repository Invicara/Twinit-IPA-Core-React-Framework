/**
 * ****************************************************************************
 *
 * INVICARA INC CONFIDENTIAL __________________
 *
 * Copyright (C) [2012] - [2019] INVICARA INC, INVICARA Pte Ltd, INVICARA INDIA
 * PVT LTD All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains the property of
 * Invicara Inc and its suppliers, if any. The intellectual and technical
 * concepts contained herein are proprietary to Invicara Inc and its suppliers
 * and may be covered by U.S. and Foreign Patents, patents in process, and are
 * protected by trade secret or copyright law. Dissemination of this information
 * or reproduction of this material is strictly forbidden unless prior written
 * permission is obtained from Invicara Inc.
 */

import React, {useEffect, useState} from "react";

import {compose} from "redux";
import {connect} from "react-redux";
import {
    addFilesToUpload,
    cleanFiles, fetchColumnConfig, getAssociatedEntities, getColumnConfig,
    getFilesToUpload, getRejectedFiles,
    setRejectedFiles,
    isComplete, isReadyFor,
    loadAssociatedEntities, updateFileAttribute, updateMultipleFileAttribute,
    uploadFiles
} from "../../redux/slices/files";
import {UploadFilesWizardSteps} from "./UploadWizardSteps";
import {SeedAttributes} from "./SeedAttributes";
import {FileTable, getValue} from "./FilesTable";
import {FileUploadTable} from "./FilesUploadTable";
import {WizardButtons} from "./misc";
import _ from 'lodash'

import ScriptHelper from "../../IpaUtils/ScriptHelper";
import './UploadFilesWizard.scss'
import { CropLandscapeOutlined } from "@material-ui/icons";

const UploadFilesWizard = ({queryParams, loadAssociatedEntities, onLoadComplete, handler: {config}, cleanFiles, files, rejectedFiles,
                               addFilesToUpload, selectedItems, updateMultipleFileAttribute, uploadFiles, associatedEntities, columnConfig, fetchColumnConfig, setRejectedFiles}) => {

    const [selectedStep, setSelectedStep] = useState(1);
    const [uploadContainer, setUploadContainer] = useState(selectedItems.selectedProject.rootContainer)

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
        setSelectedStep(2)
        addFilesToUpload([...newFiles], uploadContainer, config.scripts.preprocessFiles)
    }

    const cancel = () => {
        cleanFiles();
        setSelectedStep(1)
    };
    const removeRejectedFiles = () => setRejectedFiles([])

    const startUpload = () => {
        setSelectedStep(3);
        uploadFiles(uploadContainer, config.scripts.processUploadFile, config.scripts.postprocessFiles)
    }

    const handleFileChange = config.readonly ? _.noop : (files, field, newValue) => updateMultipleFileAttribute(
        files.map(file =>({name: file.name, [field]: newValue}))
    );

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

    const steps = [
        {name: 'Add Files', component: config.scripts.seedAttributes ? <SeedAttributes onClick={seedAttributes} /> : <div/>},
        {
            name: 'Enter Required Data',
            component: columnConfig ?
                <FileTable columns={columnConfig} files={files} onFileChange={handleFileChange}/> : 'Loading...',
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
                    <span className={'button-content'}>Review<i className="fas fa-angle-right"/></span> :
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
                primaryContent: <span className={'button-content'}>Return<i className="fas fa-angle-right"/></span>,
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
    />
}

const mapStateToProps = state => ({
    files: getFilesToUpload(state),
    associatedEntities: getAssociatedEntities(state),
    rejectedFiles: getRejectedFiles(state),
    columnConfig: getColumnConfig(state)
});

const mapDispatchToProps = {
    addFilesToUpload, cleanFiles, uploadFiles, loadAssociatedEntities, updateMultipleFileAttribute, fetchColumnConfig, setRejectedFiles
}

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
)(UploadFilesWizard)


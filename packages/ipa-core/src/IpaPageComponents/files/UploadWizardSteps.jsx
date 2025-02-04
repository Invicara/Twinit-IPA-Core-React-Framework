import React, {useEffect, useState} from "react";
import clsx from "clsx";
import GenericMatButton from "../../IpaControls/GenericMatButton";
import Dialog from "@mui/material/Dialog/Dialog";
import {WizardTimeline} from "./WizardTimeline";
import {ChooseFiles} from "./ChooseFiles";
import {PanelToggle} from "./misc";
import _ from 'lodash'
import { LinearProgress, makeStyles } from "@mui/material";

export const UploadFilesWizardSteps = ({steps, selectedStep, addFiles, startUpload, associatedEntities, rejectedFiles, uploadIconName, hideDefaultError = false, removeRejectedFiles, isloading}) => {
    const [panelOpen, setPanelOpen] = useState(selectedStep === 1)
    const [dialogOpen, setDialogOpen] = useState(false);

    //TODO if this gets more complex, make panelOpen calculable from actual state and selected step
    useEffect(() => {
        if (selectedStep === 1) {
          setPanelOpen(true);
          removeRejectedFiles()
        }
      }, [selectedStep]);

    const togglePanel = () => setPanelOpen(open => !open)

    const closeDialog = () => setDialogOpen(false);

    const handleFilesAdded = newFiles => {
        addFiles(newFiles)
        setPanelOpen(false)
    }

    const handleUpload = () => {
        closeDialog()
        startUpload()
    }

    const hasEntities = !_.isEmpty(associatedEntities)

    const assetList = <ul>
        {associatedEntities.map(entity => <li key={entity._id} className={'file-asset'}>{entity['Entity Name']}</li>)}
    </ul>;

    const Buttons = steps[selectedStep - 1].buttons;

    const useStyles = makeStyles(theme => ({
        root: {
            flexGrow: 1
        },
        colorPrimary: {
            background: '#C71784'
        },
        barColorPrimary: {
            background: 'white'
        },
        customTabRoot: {
            color: ' #3E3E3E',
            "& .Mui-selected": {
                color: "#C71784",
                },
        },
        customTabIndicator: {
            backgroundColor: "#C71784"
        }
    }));
    
    const classes = useStyles();

    return <div className="upload-files-wizard-root with-buttons">
        {isloading? <LinearProgress classes={{ colorPrimary: classes.colorPrimary, barColorPrimary: classes.barColorPrimary }} className={'table-loading-bar'}/> : null}
        <div className={clsx('wizard-panel', panelOpen && 'wizard-panel-expanded')}>
            <WizardTimeline steps={steps.map(({name}) => name)}
                            selectedStep={selectedStep}/>
            {<ChooseFiles iconName={uploadIconName} onAddFiles={handleFilesAdded} display={panelOpen}/>}
            {!panelOpen && <PanelToggle disabled={selectedStep > 2} onClick={togglePanel}/>}
        </div>
        <div className={clsx('files-area', panelOpen && 'extra-margin')}>
            {hasEntities && <div className="files-area-title">
                Files will be associated with:
                {assetList}
            </div>}
            {steps.map(({component}) => component)[selectedStep - 1]}
        </div>
        {!_.isEmpty(rejectedFiles) && 
        <div className={'rejected-files'}>
            {!hideDefaultError && `*The following files were rejected and will not be uploaded: ${rejectedFiles.map(f => f.name).join(' ,')}`}
            {rejectedFiles.map(f =>  f.errorMessage ? <p>{f.errorMessage}</p> : null)}
        </div>}
        {Buttons && <Buttons optionsOverride={selectedStep === 2 && hasEntities ? {onPrimaryClick: () => setDialogOpen(true)} : {}}/>}
        <Dialog onClose={closeDialog}  open={dialogOpen}>
            <div className={'dialog-content with-buttons'}>
                <div className={'dialog-title'}>Confirm File Association</div>
                <div className={'dialog-body'}>
                    Are you sure you want to upload these files with your selected metadata and associate them with the following:
                </div>
                {assetList}
                <div className={'dialog-actions'}>
                    <GenericMatButton customClasses="main-button"
                                      onClick={handleUpload}><i className="fas fa-upload"/> Upload</GenericMatButton>
                    <GenericMatButton customClasses="cancel-button"
                                      onClick={closeDialog}>Cancel</GenericMatButton>
                </div>
            </div>
        </Dialog>
    </div>
}
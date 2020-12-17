import React, {useRef, useState} from "react";
import clsx from "clsx";
import {OrDivider} from "../../IpaControls/OrDivider";
import GenericMatButton from "../../IpaControls/GenericMatButton";
import _ from 'lodash'

export const ChooseFiles = ({onAddFiles, display}) => {
    const [dragging, isDragging] = useState(false)
    const fileInput = useRef();

    const handleFileSelect = () => {
        if(!_.isEmpty(fileInput.current.files)) onAddFiles(fileInput.current.files);
        fileInput.current.value = null
    }

    const handleFileDrop = event => {
        event.preventDefault()
        isDragging(false)
        onAddFiles(event.dataTransfer.files)
    }

    return <div className="dropzone-anchor" style={{opacity: display ? 1 : 0, visibility: display ? 'visible' : 'hidden'}}>
        <div className={clsx("dropzone", dragging && "dragging")} onDrop={handleFileDrop}
             onDragEnter={() => isDragging(true)}
             onDragLeave={() => isDragging(false)} onDragOver={e => e.preventDefault()}
        >
            <i className={`fas fa-cloud-upload-alt cloud-icon`}/>
            <div className="dropzone-legend">Drag and drop files here</div>
            <OrDivider width="260px"/>
            <GenericMatButton customClasses="main-button"
                              onClick={() => fileInput.current.click()}>Browse</GenericMatButton>
            <input ref={fileInput} onChange={handleFileSelect} type="file" hidden multiple/>
        </div>
    </div>
}
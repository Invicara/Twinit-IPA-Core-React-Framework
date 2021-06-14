import React, {useEffect} from "react";
import {Star} from "./misc";
import Checkbox from "@material-ui/core/Checkbox/Checkbox";
import CheckedCircle from '@material-ui/icons/RadioButtonChecked';
import UncheckedCircle from '@material-ui/icons/RadioButtonUnchecked';
import mime from "mime-types";
import {FileStatus, getBlob, isComplete, isInProgress, isPending} from "../../redux/slices/files";
import {formatBytes} from "../../IpaUtils/bytesunit";

const iconStyle = {fontSize: 18};
const mainGreen = '#00A693';

export const RoundFullCheckbox = ({...props}) => <Checkbox
    icon={<UncheckedCircle style={{...iconStyle, color: '#666666'}}/>}
    checkedIcon={<CheckedCircle style={{...iconStyle, color: mainGreen}}/>}
    {...props}
/>;

export const FileUploadTable = ({files:inputFiles}) => {

    const getType = file => {
        const extension = mime.extension(getBlob(file).type);
        const splitFileName = getBlob(file).name.split('.');
        const inferredExtension = splitFileName[splitFileName.length - 1];
        return (extension && extension.toUpperCase()) || (inferredExtension && inferredExtension.toUpperCase()) || "UNKNOWN";
    }

    return <div className="file-table-container">
        <table className="file-table">
            <thead>
            <tr className="file-table-header">
                <th>
                    <RoundFullCheckbox disabled checked={inputFiles.every(isComplete)} />
                </th>
                <th>Name</th>
                <th>File Type</th>
                <th>Size</th>
                <th>Status</th>
            </tr>
            </thead>
            <tbody>
            {inputFiles.map((file,i) => <tr key={i} className="file-table-body" style={isPending(file) ? {color: '#B2B2B2'} : {}}>
                <td>
                    <RoundFullCheckbox disabled checked={isComplete(file)} />
                </td>
                <td>{file.name}</td>
                <td>{getType(file)}</td>
                <td>{isInProgress(file) ?  `${formatBytes(file.bytesUploaded)} of ${formatBytes(getBlob(file).size)}` : formatBytes(getBlob(file).size)}</td>
                <td style={isComplete(file) ? {color: mainGreen} : {}}>{file.status}</td>
            </tr>)}
            </tbody>
        </table>
    </div>
}
import {
  RoundCheckbox,
  TickCheckbox,
  useChecked,
} from '../../IpaControls/Checkboxes';
import React, { useEffect, useRef } from 'react';
import { Star } from './misc';
import { comesFromComplexSelect, isReadyFor } from '../../redux/slices/files';
import _ from 'lodash';

export const getValue = (value) =>
  (comesFromComplexSelect(value)
    ? _.values(value)
        .map(([actualValue]) => actualValue)
        .filter((v) => !!v)
        .join(' - ')
    : value) || '-';

export const FileTable = ({
  files: inputFiles,
  columns,
  onFileChange,
  readonly,
  setIsLoading,
  LinkedSelectValues,
}) => {
  const {
    allChecked,
    handleCheck,
    handleAllCheck,
    items: files,
  } = useChecked(inputFiles, (file) => file.name);

  const isReady = isReadyFor(columns);

  const getControl = (col, file, LinkedSelectValues) =>
    col.control
      ? col.control(
          file.fileAttributes[col.name], // value
          (value) =>
            onFileChange(
              file.checked ? [...files.filter((f) => f.checked), file] : [file],
              col.name,
              value,
            ),
          LinkedSelectValues,
        )
      : 'loading...';

  const tableRef = useRef();

  useEffect(() => {
    async function fetchData() {
      let finalRenderedFile;
      const lastFileName = files[files.length - 1]?.name;
      if (lastFileName) finalRenderedFile = tableRef.current?.innerText;

      if (
        !_.isUndefined(finalRenderedFile) &&
        finalRenderedFile === lastFileName
      ) {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [files]);

  return (
    <div className="file-table-container">
      <table className="file-table">
        <thead>
          <tr className="file-table-header">
            <th>
              <RoundCheckbox checked={allChecked} onChange={handleAllCheck} />
            </th>
            <th>Name</th>
            <th>
              <TickCheckbox
                checked={inputFiles.every(isReady)}
                onChange={() => {}}
              />
            </th>
            <th>V</th>
            {columns.map((col) => (
              <th className={'long'} key={col.name}>
                {col.displayAs}
                {col.required && <Star />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {_.isEmpty(inputFiles)
            ? 'Loading files...'
            : files.map((file, i) => (
                <tr key={i} className="file-table-body">
                  <td>
                    <RoundCheckbox
                      checked={_.get(files[i], 'checked', false)}
                      onChange={() => handleCheck(files[i])}
                    />
                  </td>
                  <td ref={tableRef}>{file.name}</td>
                  <td>
                    <TickCheckbox checked={isReady(file)} onChange={() => {}} />
                  </td>
                  <td>{file.fileBlob?.nextVersionNumber || file.version}</td>
                  {columns.map((col) => (
                    <td key={col.name}>
                      {readonly
                        ? getValue(file.fileAttributes[col.name])
                        : getControl(col, file, LinkedSelectValues)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
};

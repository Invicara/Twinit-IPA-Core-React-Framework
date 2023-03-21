import React, { useState, useEffect } from 'react'
import SimpleSelect from '../../IpaControls/SimpleSelect';
import { PinkCheckbox } from "../../IpaControls/Checkboxes";
import { Tooltip } from "@material-ui/core";
import './DocumentTable.scss'
import _, { filter } from 'lodash'
import * as modal from '../../redux/slices/modal'
import { useStore } from "react-redux";
import ReorderColumnsModal from './ReorderColumnsModal'
import moment from 'moment';
import { ControlPointSharp } from '@material-ui/icons';

const DocumentTable = props => {
  const initialSelectedDocuments = []
  const [selectedDocumentsIds, setSelectedDocumentsIds] = useState(initialSelectedDocuments);
  const [sort, setSort] = useState(props.tableConfig.sort)
  const [documents, setDocuments] = useState(props.documents)
  function getDocActions(docIndex) {
    let doc = documents[docIndex];

    let actionsConfig = {};

    _.forEach(doc.actions, (action => {
      actionsConfig[action.key] = action;
    }))

    props.actions.forEach(action => {
      //if the action was found at the document level, we already have the right config for the action
      let actionIsAlreadyDefinedOnDoc = _.keys(actionsConfig).includes(action.key)
      //If the "single" property is defined, it means there is a common config defined for this action.
      let commonActionConfig = !!action.single

      if (!actionIsAlreadyDefinedOnDoc && commonActionConfig) {
        const { key, name, icon, onClick, single } = action;
        actionsConfig[action.key] = { key, name, icon, onClick, ...single };
      }
    })

    return actionsConfig
  }

  function getSelectedDocuments(selectedIndeces) {
    return documents.filter((d) => selectedIndeces.includes(d.documentData._fileId));
  }

  const reduxStore = useStore();
  const OpenReorderModal = (columns, onColumnsChange, lockedColumns) => {
    reduxStore.dispatch(modal.actions.setModal({
      component: ReorderColumnsModal,
      props: { columns, onColumnsChange, lockedColumns },
      open: true
    }))
  }
  const sortBy = (name, isDescending) => {
    setSort({ currentColumn: name, isDescending: !isDescending })

  }
  const allSelected = selectedDocumentsIds.length === documents.length;

  useEffect(() => {
    if (sort && !_.isEmpty(sort.currentColumn)) {
      let newDocuments = _.sortBy(props.documents, a => {
        if (_.includes(sort.currentColumn, 'properties.')) return a.documentData[`${sort.currentColumn}.val`]
        else return a.documentData[sort.currentColumn]
      })
      if (sort && sort.isDescending) newDocuments = _.reverse(newDocuments)
      setDocuments(newDocuments)
    }
    if (props.documents.length > 0) {
      let newDocs = props.documents
      if(newDocs.length != documents.length){
         setDocuments(newDocs)
        }
    }
  }, [sort, props.documents])

  const toogleVersionDrop = (fileId) => {
    if (!document.querySelector(`.${fileId}`).classList.contains("document-table__version_dropdown_show"))
      document.querySelector(`.${fileId}`).classList.add("document-table__version_dropdown_show")
    else document.querySelector(`.${fileId}`).classList.remove("document-table__version_dropdown_show")
  }
  const setSelectedVersion = (version, doc) => {
    let newDocuments = [...documents]
    let newSelectedDocumentsIds = []
    const selectedDocIndex = selectedDocumentsIds.findIndex((id) => id === doc.documentData.fileId);
    if (!doc.currentVersion.includes(version)) {
      newDocuments.find(d => d.documentData._fileId === doc.documentData._fileId)?.currentVersion.push(version)
      if (selectedDocIndex === -1) {
        if (!_.isEmpty(selectedDocumentsIds)) newSelectedDocumentsIds = [...selectedDocumentsIds]
        if (!newSelectedDocumentsIds.includes(doc.documentData._fileId)) newSelectedDocumentsIds.push(doc.documentData._fileId);
      }
    }
    else {
      _.pull(newDocuments.find(d => d.documentData._fileId === doc.documentData._fileId)?.currentVersion, version)
      if (selectedDocIndex != -1) {
        if (!_.isEmpty(selectedDocumentsIds)) newSelectedDocumentsIds = [...selectedDocumentsIds]
        if (newSelectedDocumentsIds.includes(doc.documentData._fileId)) _.pull(newSelectedDocumentsIds, doc.documentData._fileId)
      }
    }
    setSelectedDocumentsIds(newSelectedDocumentsIds)
    setDocuments(newDocuments)
  }

  const selectAllVersions = (doc) => {
    let newDocuments = [...documents]
    doc.documentData.versions.forEach(v => {
      if (!newDocuments.find(d => d.documentData._fileId === doc.documentData._fileId)?.currentVersion.includes(v))
        newDocuments.find(d => d.documentData._fileId === doc.documentData._fileId)?.currentVersion.push(v)
    })
    setDocuments(newDocuments)
  }

  const deselectAllVersions = (doc) => {
    let newDocuments = [...documents]
    if (doc.documentData.versions.length > 1) {
      doc.documentData.versions.forEach(v => {
        _.pull(newDocuments.find(d => d.documentData._fileId === doc.documentData._fileId)?.currentVersion, v)
      })
      setDocuments(newDocuments)
    }
  }

  const isDisabled = (doc, action) => {
    if (doc.currentVersion.length > 0) {
      if (action.key === "VIEW") {
        if (props.tableConfig.supportedTypes.includes(doc.documentData.name.split('.')[1])) {
          return true
        }
        else {
          return false
        }
      }
      else return true
    }
    else return false
  }

  return <div className="document-table">
    <div className='document-table__actions document-table__actions--bulk'>
      {props.actions
        .filter(action => action.bulk.hidden !== true)
        .map(action => {
          let defaultProps = {
            disabled: action.bulk.disabled,
            title: action.name,
            children: action.name,
            icon: action.icon,
            onClick: () => action.onClick(getSelectedDocuments(selectedDocumentsIds))
          }
          if (action.bulk.component) {
            return <action.bulk.component {...defaultProps} {...action.bulk.props} />;
          }
          return <div className={`document-table__action document-table__action${selectedDocumentsIds.length > 0 ? '_enabled' : '_disabled'}`} >
            <a onClick={defaultProps.onClick}>
              <i className={defaultProps.icon} />
              <span>{defaultProps.title}</span>
            </a>
          </div>
        })
      }
    </div>
    {documents.length > 0 ? <div className={`document-table__count`} >Showing {documents.length} files</div> : null}
    {documents.length > 0 ?
      <table className="document-table__table">
        <tr className="document-table__row document-table__row--header">
          <th className="document-table__col document-table__col--header document-table__col--select">
            <PinkCheckbox
              onChange={() => {
                if (allSelected) {
                  setSelectedDocumentsIds(initialSelectedDocuments)
                  documents.forEach((d) => {
                    if (d.documentData.versions.length > 1) deselectAllVersions(d)
                  })
                } else {
                  setSelectedDocumentsIds(documents.map((d) => {
                    if (d.documentData.versions.length > 1) selectAllVersions(d)
                    return d.documentData._fileId
                  }));
                }
              }}
              checked={allSelected}
            />
          </th>
          <th className="document-table__col document-table__col--header document-table__col document-table__col--actions">
          </th>
          <th className="document-table__col document-table__col--header">
            <div>Version
              <span className={`document-table_lock`}>
                <i className={`fas ${_.includes(props?.tableConfig?.lockedColumns, "Version") ? 'fa-lock' : ''}`}></i>
              </span>
            </div>
          </th>
          <th className="document-table__col document-table__col--filename">
            <div>Filename
              <span className={`document-table__filter${sort ? sort.currentColumn === 'name' ? '_active' : '' : ''}`}>
                <i onClick={() => sortBy('name', sort ? sort.isDescending : true)}
                  className={`fas ${sort ? sort.isDescending ? 'fa-sort-amount-up' : 'fa-sort-amount-down' : 'fa-sort-amount-down'}`}></i>
              </span>
            </div>
          </th>
          {props.tableConfig.columns.filter(col => col.active)
            .map((column, index, array) => {
              return <th className="document-table__col document-table__col--header"><div>
                {column.name}
                <span className={`document-table_lock`}>
                  <i className={`fas ${_.includes(props?.tableConfig?.lockedColumns, column.name) ? 'fa-lock' : ''}`}></i>
                </span>
                <span className={`document-table__filter${sort ? sort.currentColumn === column.accessor ? '_active' : '' : ''}`}>
                  <i onClick={() => sortBy(column.accessor, sort ? sort.isDescending : true)}
                    className={`fas ${sort ? sort.isDescending ? 'fa-sort-amount-up' : 'fa-sort-amount-down' : 'fa-sort-amount-down'}`}></i>
                </span>
                {array.length === index + 1 ? <span className='document-table__reorder_button'><i onClick={() => OpenReorderModal(props.tableConfig.columns, props.tableConfig.onColumnsChange, props?.tableConfig?.lockedColumns)} className={"fas fa-columns"}></i></span> : null}
              </div></th>
            })}

        </tr>
        {documents.map((doc, index) => {
          const date = moment(doc.documentData._metadata[props.tableConfig.dateField])
          const fileId = doc.documentData._fileId;
          const selectedDocIndex = selectedDocumentsIds.findIndex((id) => id === fileId);

          let checked = selectedDocIndex != -1 && (doc.documentData.versions.length > 1 ? doc.currentVersion.length === doc.documentData.versions.length : true)
          let partialChecked = doc.currentVersion.length < doc.documentData.versions.length && doc.currentVersion.length != 0
          let versions = _.intersection(doc.documentData.versions, doc.currentVersion)
          return <tr className="document-table__row">
            <td className="document-table__col document-table__col--select">
              <PinkCheckbox
                onChange={() => {
                  let newSelectedDocuments = [...selectedDocumentsIds]
                  if (checked) {
                    newSelectedDocuments.splice(selectedDocIndex, 1);
                    deselectAllVersions(doc)
                  } else {
                    newSelectedDocuments.push(fileId);
                    selectAllVersions(doc)
                  }
                  setSelectedDocumentsIds(newSelectedDocuments)
                }}
                checked={checked}
                indeterminate={partialChecked}
              />
            </td>
            <td className="document-table__col document-table__col--actions">
              <div className='document-table__actions document-table__actions--row'>
                {_.values(getDocActions(index)).map(action => {

                  if (action.hidden === true) return null

                  let defaultProps = {
                    disabled: !action.disabled,
                    title: action.name,
                    children: action.name,
                    icon: action.icon,
                    onClick: () => action.onClick([doc])
                  }
                  const disabled = defaultProps.disabled && isDisabled(doc, action)
                  if (action.component) {
                    return <action.component {...defaultProps} {...action.props} />;
                  }
                  return <span className={`document-table__action-button`}>
                    <Tooltip title={defaultProps.title}>
                      <i className={`${defaultProps.icon} ${disabled.toString()}`} onClick={defaultProps.onClick} />
                    </Tooltip>
                  </span>
                })}
              </div>
            </td>
            <td className="document-table__col document-table__col--version">
              <div>
                <div className={`document-table__version_display`}>
                  {versions.map((v, i) => { return `${v.versionNumber}${versions.length > 1 && versions.length != i + 1 ? ',' : ''}` })}
                  <span className={`${doc.documentData.versions.length > 1 ? 'document-table_dropdown_icon_enabled' : 'document-table_dropdown_icon_disabled'}`}>
                    <i className={`fas fa-caret-down`} onClick={() => toogleVersionDrop(fileId)}></i>
                  </span>
                </div>
                <div className={`document-table__version_dropdown ${fileId}`}>
                  {doc.documentData.versions.length > 1 ? doc.documentData.versions.map(v => {
                    return <div><PinkCheckbox onChange={() => setSelectedVersion(v, doc)}
                      checked={doc.currentVersion?.includes(v)} />
                      {v.versionNumber} {date.format('DD/MM/YYYY kk:mm:ss a')}</div>
                  })
                    : null}
                </div>
              </div>
            </td>
            <td className="document-table__col document-table__col--name">
              {doc.documentData.name}
            </td>
            {props.tableConfig.columns.map(column => {
              if (column.active) {
                let value = _.get(doc.documentData, column.accessor, "");
                if (value === null) {
                  value = ""
                }
                if (_.isObject(value)) {
                  value = value.val
                }
                return <td className="document-table__col">{value}</td>
              }
            })}
          </tr>
        })}
      </table> :
      <div>No document to display</div>
    }

  </div>
}


export default DocumentTable;
import React, { useState, useEffect } from 'react'
import SimpleSelect from '../../IpaControls/SimpleSelect';
import {PinkCheckbox} from "../../IpaControls/Checkboxes";
import { Tooltip } from "@material-ui/core";
import './DocumentTable.scss'
import _, { filter } from 'lodash'
import * as modal from '../../redux/slices/modal'
import { useStore } from "react-redux";
import ReorderColumnsModal from './ReorderColumnsModal'

const DocumentTable = props => {
    const initialSelectedDocuments = []
    const [selectedDocumentsIds, setSelectedDocumentsIds] = useState(initialSelectedDocuments);
    const [sort, setSort] = useState(props.tableConfig.sort)
    const [documents, setDocuments] = useState(props.documents)
    const [view, setView] = useState(false);
  
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
  
        if(!actionIsAlreadyDefinedOnDoc && commonActionConfig) {
          const {key, name, icon, onClick, single} = action;
          actionsConfig[action.key] = {key, name, icon, onClick, ...single};
        }
      })
  
      return actionsConfig
    }
  
    function getSelectedDocuments(selectedIndeces) {
      return documents.filter((d) => selectedIndeces.includes(d.documentData._fileId));
    }

    const reduxStore = useStore();
    const OpenReorderModal =  (columns, onColumnsChange)=>{
      reduxStore.dispatch(modal.actions.setModal({
        component: ReorderColumnsModal, 
        props: {columns, onColumnsChange}, 
        open: true
      }))
    }
    const sortBy =  (name, isDescending) => {
      console.log('sort by', name)
      setSort({currentColumn: name, isDescending:!isDescending})
      
    }
    const allSelected = selectedDocumentsIds.length === documents.length; 
    
    useEffect(() => {
      console.log('sort', sort)
      if(sort){
        let newDocuments =  _.sortBy(documents, a => {
          if(_.includes(sort.currentColumn, 'properties.')) return a.documentData[`${sort.currentColumn}.val`]
            else return a.documentData[sort.currentColumn]
        })
      if(sort && sort.isDescending) newDocuments = _.reverse(newDocuments)
      console.log('newDocuments', newDocuments)
       setDocuments(newDocuments)
      }
    }, [sort])

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
            if(action.bulk.component) {
                return <action.bulk.component {...defaultProps} {...action.bulk.props}/>;
            }
            return <div className={`document-table__action document-table__action${selectedDocumentsIds.length > 0 ? '_enabled' : '_disabled' }`} >
                      <a onClick={defaultProps.onClick}>
                            <i className={defaultProps.icon}/>
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
                  if(allSelected) {
                    setSelectedDocumentsIds(initialSelectedDocuments)
                  } else {
                    setSelectedDocumentsIds(documents.map((d) => d.documentData._fileId ));
                  }
                }}
                checked={allSelected}
              />
            </th>
            <th className="document-table__col document-table__col--header document-table__col document-table__col--actions">
            </th>
            <th className="document-table__col document-table__col--header">
              Version
            </th>
            <th className="document-table__col document-table__col--filename">
              <div>Filename
                  <span className={`document-table__filter${sort ? sort.currentColumn === 'name' ? '_active': '' : ''}`}>
                    <i onClick= {()=>sortBy('name', sort ? sort.isDescending : true)} 
                      className={`fas ${sort ? sort.isDescending ? 'fa-sort-amount-up': 'fa-sort-amount-down' : 'fa-sort-amount-down'}`}></i>
                  </span>
              </div>
            </th>
            {props.tableConfig.columns.filter(col => col.active)
            .map((column, index, array) => {
              return <th className="document-table__col document-table__col--header"><div>
                      {column.name}
                        <span className={`document-table__filter${sort ? sort.currentColumn === column.accessor ? '_active': '' : ''}`}>
                          <i onClick= {()=>sortBy(column.accessor, sort ? sort.isDescending : true)} 
                            className={`fas ${sort ? sort.isDescending ? 'fa-sort-amount-up': 'fa-sort-amount-down' : 'fa-sort-amount-down'}`}></i>
                        </span>
                      {array.length === index + 1 ? <span className='document-table__reorder_button'><i onClick= {() => OpenReorderModal(props.tableConfig.columns, props.tableConfig.onColumnsChange)} className={"fas fa-columns"}></i></span> : null}
                      </div></th> 
            })}
            
          </tr>
          {documents.map((doc, index) => {
            const fileId = doc.documentData._fileId;
            const selectedDocIndex = selectedDocumentsIds.findIndex((id) => id === fileId);
            let checked = selectedDocIndex != -1;
            return <tr className="document-table__row">
              <td className="document-table__col document-table__col--select">
                <PinkCheckbox 
                  onChange={() => {
                    let newSelectedDocuments = [...selectedDocumentsIds]
                    if(checked) {
                      newSelectedDocuments.splice(selectedDocIndex, 1);
                    } else {
                      newSelectedDocuments.push(fileId);
                    }
                    setSelectedDocumentsIds(newSelectedDocuments)
                  }}
                  checked={checked} 
                />
              </td>
              <td className="document-table__col document-table__col--actions">
                <div className='document-table__actions document-table__actions--row'>
                    {_.values(getDocActions(index)).map(action => {
                        
                    if(action.hidden === true) return null
    
                    let defaultProps = {
                        disabled: action.disabled,
                        title: action.name,
                        children: action.name,
                        icon: action.icon,
                        onClick: () => action.onClick([doc])
                    }
                    if(action.component) {
                        return <action.component {...defaultProps} {...action.props}/>;
                    }
                    return <span className={`document-table__action-button`}>
                                <Tooltip title={defaultProps.title}>
                                    <i className={defaultProps.icon} onClick={defaultProps.onClick}/>
                                </Tooltip>
                            </span>
                    })}
                </div>
              </td>
              <td className="document-table__col document-table__col--version">
                <SimpleSelect 
                  className='document-table__version-select'
                  disabled={doc.disableVersions}
                  clearable={false}
                  options={doc.documentData.versions.map(v => v.versionNumber)} 
                  value={doc.documentData.versions.find(v => v._fileVersionId === doc.currentVersion).versionNumber}
                  handleChange={(value) => {
                    let fileId = doc.documentData._fileId;
                    let versionId = doc.documentData.versions.find(v => v.versionNumber === value)._fileVersionId;
                    doc.setCurrentVersion(
                      fileId, 
                      versionId
                    )
                  }}
                />
              </td>
              <td className="document-table__col document-table__col--name">
               {doc.documentData.name}
              </td>
              {props.tableConfig.columns.map(column => {
              if(column.active)
                {let value = _.get(doc.documentData, column.accessor, "");
                if(value === null) {
                  value = ""
                }
                if(_.isObject(value)) {
                  value = value.val
                }
                return <td className="document-table__col">{value}</td>
                }})}
            </tr>
          })}
        </table> :
        <div>No document to display</div>
      }
      
    </div>
  }


  export default DocumentTable;
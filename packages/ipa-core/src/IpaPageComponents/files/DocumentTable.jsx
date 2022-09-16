import React, { useState } from 'react'
import SimpleSelect from '../../IpaControls/SimpleSelect';
import { Checkbox } from '@material-ui/core';
import GenericMatButton from '../../IpaControls/GenericMatButton'
import ActionButton from '../../IpaControls/ActionButton';
import './DocumentTable.scss'
import _ from 'lodash'

const DocumentTable = props => {

    const initialSelectedDocuments = []
    const [selectedDocumentsIds, setSelectedDocumentsIds] = useState(initialSelectedDocuments);
    const [view, setView] = useState(false);
  
    function getDocActions(docIndex) {
      let doc = props.documents[docIndex];
  
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
      return props.documents.filter((d) => selectedIndeces.includes(d.documentData._fileId));
    }
    
    const allSelected = selectedDocumentsIds.length === props.documents.length; 
    
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
            return <ActionButton {...defaultProps}/>
            })
        }
      </div>
      {props.documents.length > 0 ?
        <table className="document-table__table">
          <tr className="document-table__row document-table__row--header">
            <th className="document-table__col document-table__col--header document-table__col--select">
              <Checkbox 
                onChange={() => {
                  if(allSelected) {
                    setSelectedDocumentsIds(initialSelectedDocuments)
                  } else {
                    setSelectedDocumentsIds(props.documents.map((d) => d.documentData._fileId ));
                  }
                }}
                checked={allSelected}
              />
            </th>
            <th className="document-table__col document-table__col--filename">
              Filename
            </th>
            <th className="document-table__col document-table__col--header document-table__col document-table__col--actions">
            </th>
            <th className="document-table__col document-table__col--header">
              Version
            </th>
            {props.tableConfig.columns.map(column => {
            return <th className="document-table__col document-table__col--header">{column.name}</th>
            })}
          </tr>
          {props.documents.map((doc, index) => {
            const fileId = doc.documentData._fileId;
            const selectedDocIndex = selectedDocumentsIds.findIndex((id) => id === fileId);
            let checked = selectedDocIndex != -1;
            return <tr className="document-table__row">
              <td className="document-table__col document-table__col--select">
                <Checkbox 
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
              <td className="document-table__col document-table__col--name">
               {doc.documentData.name}
              </td>
              <td className="document-table__col document-table__col--actions">
                <div className=' document-table__actions document-table__actions--row'>
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
                    return <ActionButton {...defaultProps}/>
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
              {props.tableConfig.columns.map(column => {
              let value = _.get(doc.documentData, column.accessor, "");
              if(value === null) {
                value = ""
              }
              if(_.isObject(value)) {
                value = value.val
              }
              return <td className="document-table__col">{value}</td>
              })}
            </tr>
          })}
        </table> :
        <div>No document to display</div>
      }
      
    </div>
  }


  export default DocumentTable;
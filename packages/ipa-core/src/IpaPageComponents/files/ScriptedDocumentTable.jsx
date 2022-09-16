import { Checkbox } from '@material-ui/core';
import React, { useState } from 'react'
import { config } from 'react-transition-group'
import GenericMatButton from '../../IpaControls/GenericMatButton'
import SimpleSelect from '../../IpaControls/SimpleSelect';
import FileHelpers from '../../IpaUtils/FileHelpers';


const DocumentTable = props => {

  let initialSelectedDocuments = new Array(props.documents.length).fill(false);

  const [selectedDocumentsIndeces, setSelectedDocumentsIndeces] = useState(initialSelectedDocuments);

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
        const {key, name, onClick, single} = action;
        actionsConfig[action.key] = {key, name, onClick, ...single};
      }
    })

    return actionsConfig
  }

  function getSelectedDocuments(selectedIndeces) {
    const selectedDocuments = []
    _.forEach(selectedIndeces, (value, key) => {
      if(value) {
        selectedDocuments.push(props.documents[key])
      }
    })

    return selectedDocuments;
  }

  function getSelectedDocumentsData(selectedIndeces) {
    return getSelectedDocuments(selectedIndeces).map(d => d.documentData);
  }

  
  
  
  return <div className="document-table">
    Document Table
    {props.actions
      .filter(action => action.bulk.hidden !== true)
      .map(action => {
        let defaultProps = {
          disabled: action.bulk.disabled,
          children: action.name,
          onClick: () => action.onClick(getSelectedDocumentsData(selectedDocumentsIndeces))
        }
        if(action.bulk.component) {
          return <action.bulk.component {...defaultProps} {...action.bulk.props}/>;
        }
        return <GenericMatButton {...defaultProps}/>
      })
    }
    {props.documents.length > 0 ?
      <table className="document-table__table">
        <tr className="document-table__header-row document-table__row">
          <th className="document-table__header-col document-table__col document-table__col--select">
            <Checkbox 
              onChange={() => {
                let checked = !selectedDocumentsIndeces.every((check) => check === true)
                if(checked) {
                  setSelectedDocumentsIndeces([...initialSelectedDocuments].fill(true));
                } else {
                  setSelectedDocumentsIndeces(initialSelectedDocuments)
                }
              }}
              checked={selectedDocumentsIndeces.every((check) => check === true)}
            />
          </th>
          <th className="document-table__header-col document-table__col document-table__col--actions">
          </th>
          <th className="document-table__header-col document-table__col document-table__col--actions">
            Version
          </th>
          {_.entries(props.documents[0]?.documentData?.properties).map(([key, doc]) => {
            return <th className="document-table__col">{key}</th>
          })}
        </tr>
        {props.documents.map((doc, index) => {
          return <tr className="document-table__row">
            <td className="document-table__col document-table__col--select">
              <Checkbox 
                onChange={() => {
                  let checked = !selectedDocumentsIndeces[index]
                  let newSelectedDocuments = [...selectedDocumentsIndeces]
                  if(checked) {
                    newSelectedDocuments[index] = true
                  } else {
                    newSelectedDocuments[index] = false
                  }
                  setSelectedDocumentsIndeces(newSelectedDocuments)
                }}
                checked={selectedDocumentsIndeces[index]} 
              />
            </td>
            <td className="document-table__col document-table__col--actions">
              {_.values(getDocActions(index)).map(action => {
                if(action.hidden === true) return null

                let defaultProps = {
                  disabled: action.disabled,
                  children: action.name,
                  onClick: () => action.onClick([doc.documentData])
                }
                if(action.component) {
                  return <action.component {...defaultProps} {...action.single.props}/>;
                }
                return <button {...defaultProps}/>
              })}
            </td>
            <td className="document-table__col">
              <SimpleSelect 
                disabled={doc.disableVersions}
                isClearable={false}
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
            {_.keys(props.documents[0]?.documentData?.properties).map(key => {
              let value = doc.documentData?.properties?.[key]?.val || "";
              return <td className="document-table__col">{value}</td>
            })}
          </tr>
        })}
      </table> :
      <div>No document to display</div>
    }
    
  </div>
}

const ScriptedDocumentTable = props => {

  const getInitialVersions = (documents) => {

    let initialSelectedVersions = {}

    documents.forEach((document) => {
      let firstVersion = document.versions?.[document.versions.length-1]?._fileVersionId;
      initialSelectedVersions[document._fileId] = firstVersion
    })

    return initialSelectedVersions;
  }

  const [selectedVersions, setSelectedVersions] = useState(getInitialVersions(props.data))
  const [sorting, setSorting] = useState(props.config.defaultSort)
  const [columns, setColumns] = useState(props.config.columns)

  const transformFileAttributesToProperties = document => {
    if(document.properties) {
        return document;
    }

    if (!document.fileAttributes) {
      throw new Error('NO_PROPS_OR_ATTRS')
    }

    document.properties = {}

    const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

    const toEntityPropertyName = s =>
      s
        .split(/(?=[A-Z])/)
        .map(word => capitalize(word))
        .join(' ')

    _.entries(document.fileAttributes).forEach(([key, val]) => {
      let name = key
      let type = 'text'

      if (!['dtCategory', 'dtType'].includes(key)) {
        name = toEntityPropertyName(name)
      } else {
        type = '<<HIERARCHY>>'
      }

      document.properties[name] = { dName: name, val, type }
    })

    return document
  }

  const documentsData = props.data.map(transformFileAttributesToProperties)

  let documents = documentsData.map(data => ({
    documentData: data, //contains the document data as fetched by the api
    currentVersion: selectedVersions[data._fileId],
    setCurrentVersion: (fileId, versionId) => {
      setSelectedVersions({...selectedVersions, [fileId]: versionId})
    },
    disableVersions: props.config.includeVersions !== true
  }))

  let actions = [ //top level actions config: define the behaviour of bulk actions and row actions (unless overridden by the "per document" actions config)
    {
      key: "DOWNLOAD", //is used to identify which button this action corresponds to in the presentational component
      name: "Download",
      onClick: (documents) => {
        FileHelpers.downloadDocuments(documents)
      }, //event handler for bulk action and row action (unless overriden by "per document" action config)
      bulk: {
        component: GenericMatButton,//(optional) bulk action button component, override default button from presentational component
        props: {
          disabled: !props.config.canDownload,
          children: "Download"
        }
        // disabled: !props.config.canDownload, //(optional) disabled state for bulk action, defaults to false 
        // hidden: false, //(optional) hidden state for bulk action, defaults to false
        
      },
      single: {
        // component: //(optional) row icon component with a tooltip attached for all rows (unless overriden by "per document" action config), defaults to icon from presentational component
        disabled: !props.config.canDownload, //(optional) disabled state for row action, defaults to false
        // hidden: false //(optional) hidden state for row action, defaults to false
      }
    },
    {
      key: "VIEW", //is used to identify which button this action corresponds to in the presentational component
      name: "View",
      onClick: (documents) => {}, //event handler for bulk action and row action (unless overriden by "per document" action config)
      bulk: {
        // component: <GenericMatButton/>,//(optional) bulk action button component, override default button from presentational component
        disabled: !props.config.canView, //(optional) disabled state for bulk action, defaults to false 
        // hidden: false, //(optional) hidden state for bulk action, defaults to false
      },
      single: {
        // component: //(optional) row icon component with a tooltip attached for all rows (unless overriden by "per document" action config), defaults to icon from presentational component
        disabled: !props.config.canView, //(optional) disabled state for row action, defaults to false
        // hidden: false //(optional) hidden state for row action, defaults to false
      }
    }
  ]

  let tableConfig = {
    columns, //determines which columns should be displayed (order sensitive), defaults to ["version", "name"]
    // lockedColumns: props?.config?.lockedColumns, //order insensitive
    // onColumnsChange: (columns) => {}, //callback triggered when user confirmed order change in presentational component
    sort: { //If not defined, the presentational component handles the sorting logic
      currentColumn: sorting?.column, //The currently sorted column, if null, no sorting is allowed
      onSort: setSorting, //(optional) Called by the presentational component to defined additional instructions on sort,
      isDescending: !sorting?.descending, //defaults to false
    }
  }

  return <DocumentTable documents={documents} actions={actions} tableConfig={tableConfig} />
}

export const ScriptedDocumentTableFactory = {
  create: ({ config, data }) => {
    return <ScriptedDocumentTable config={config} data={data} />
  }
}

export default ScriptedDocumentTable

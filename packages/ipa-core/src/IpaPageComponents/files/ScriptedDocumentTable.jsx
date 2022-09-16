import React, { useState } from 'react'
import GenericMatButton from '../../IpaControls/GenericMatButton'
import FileHelpers from '../../IpaUtils/FileHelpers'
import withPageNavigation from '../withPageNavigation'
import DocumentTable from './DocumentTable'

let ScriptedDocumentTable = props => {

  const getInitialVersions = (documents = []) => {
    let initialSelectedVersions = {}


    documents.forEach(document => {
      let firstVersion =
        document.versions?.[document.versions.length - 1]?._fileVersionId
      initialSelectedVersions[document._fileId] = firstVersion
    })

    return initialSelectedVersions
  }

  const [selectedVersions, setSelectedVersions] = useState(
    getInitialVersions(props.data)
  )
  const [sorting, setSorting] = useState(props.config.defaultSort)
  const [columns, setColumns] = useState(props.config.columns)

  const transformFileAttributesToProperties = document => {
    if (document.properties) {
      return document
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
      setSelectedVersions({ ...selectedVersions, [fileId]: versionId })
    },
    disableVersions: props.config.includeVersions !== true
  }))

  let actions = [
    //top level actions config: define the behaviour of bulk actions and row actions (unless overridden by the "per document" actions config)
    {
      key: 'DOWNLOAD', //is used to identify which button this action corresponds to in the presentational component
      name: 'Download',
      icon: 'icofont-upload-alt',
      onClick: documents => {
        let documentsData = documents.map(d => d.documentData)
        FileHelpers.downloadDocuments(documentsData)
      }, //event handler for bulk action and row action (unless overriden by "per document" action config)
      bulk: {
        // component: GenericMatButton,//(optional) bulk action button component, override default button from presentational component
        // props: {
        //   disabled: !props.config.canDownload,
        //   children: "Download"
        // }
        disabled: !props.config.canDownload //(optional) disabled state for bulk action, defaults to false
        // hidden: false, //(optional) hidden state for bulk action, defaults to false
      },
      single: {
        // component: //(optional) row icon component with a tooltip attached for all rows (unless overriden by "per document" action config), defaults to icon from presentational component
        disabled: !props.config.canDownload //(optional) disabled state for row action, defaults to false
        // hidden: false //(optional) hidden state for row action, defaults to false
      }
    },
    {
      key: 'VIEW', //is used to identify which button this action corresponds to in the presentational component
      name: 'View',
      icon: 'fas fa-file-export',
      onClick: documents => {
        const docIds = documents.map(d => {
          const _fileId = d.documentData._fileId
          const _fileVersionId = d.currentVersion
          return { _fileId, _fileVersionId }
        })
        let query = {
          entityType: 'file',
          queryParams: { docIds }
        }
        props.onNavigate('documentviewer', query, { newTab: true })
      }, //event handler for bulk action and row action (unless overriden by "per document" action config)
      bulk: {
        // component: <GenericMatButton/>,//(optional) bulk action button component, override default button from presentational component
        disabled: !props.config.canView //(optional) disabled state for bulk action, defaults to false
        // hidden: false, //(optional) hidden state for bulk action, defaults to false
      },
      single: {
        // component: //(optional) row icon component with a tooltip attached for all rows (unless overriden by "per document" action config), defaults to icon from presentational component
        disabled: !props.config.canView //(optional) disabled state for row action, defaults to false
        // hidden: false //(optional) hidden state for row action, defaults to false
      }
    }
  ]

  let tableConfig = {
    columns, //determines which columns should be displayed (order sensitive), defaults to ["version", "name"]
    // lockedColumns: props?.config?.lockedColumns, //order insensitive
    // onColumnsChange: (columns) => {}, //callback triggered when user confirmed order change in presentational component
    sort: {
      //If not defined, the presentational component handles the sorting logic
      currentColumn: sorting?.column, //The currently sorted column, if null, no sorting is allowed
      onSort: setSorting, //(optional) Called by the presentational component to defined additional instructions on sort,
      isDescending: !sorting?.descending //defaults to false
    }
  }

  return (
    <DocumentTable
      documents={documents}
      actions={actions}
      tableConfig={tableConfig}
    />
  )
}

ScriptedDocumentTable = withPageNavigation(ScriptedDocumentTable)

export const ScriptedDocumentTableFactory = {
  create: (...args) => {
    const { config, data } = args[0]
    return <ScriptedDocumentTable config={config} data={data} />
  }
}

export default ScriptedDocumentTable

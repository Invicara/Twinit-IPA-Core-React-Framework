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
    documentData: data,
    currentVersion: selectedVersions[data._fileId],
    setCurrentVersion: (fileId, versionId) => {
      setSelectedVersions({ ...selectedVersions, [fileId]: versionId })
    },
    disableVersions: props.config.includeVersions !== true
  }))

  let actions = [
    {
      key: 'DOWNLOAD',
      name: 'Download',
      icon: 'icofont-upload-alt',
      onClick: documents => {
        let documentsData = documents.map(d => d.documentData)
        FileHelpers.downloadDocuments(documentsData)
      },
      bulk: {
        disabled: !props.config.canDownload
      },
      single: {
        disabled: !props.config.canDownload
      }
    },
    {
      key: 'VIEW',
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
      },
      bulk: {
        disabled: !props.config.canView
      },
      single: {
        disabled: !props.config.canView
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

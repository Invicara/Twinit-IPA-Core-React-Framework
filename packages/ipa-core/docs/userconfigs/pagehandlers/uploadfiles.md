---
title: Upload Files Wizard
sidebar_position: 14
---
|Name|Description|
|---|---|
|[`pageComponent`](#pageComponent)|Use `'pageComponent: ‘files/UploadFilesWizard’` in a handler to activate the Dashboard View.|
|[`displayNameMap`](#displayNameMap-(required))|A map between the `fileAttribute` camelCase property name (on the `fileAttributes` object) and the display name for the attributes.|
|[`columns`](#columns-(required))|Defines the file attribute columns the user should see in the upload table.|
|[`scripts`](#scripts-(required---but-can-be-an-empty-object))|Provides hooks to customize the user’s upload experience, modify the files before upload, and to post-process the results of the upload to do things, such as relating files to entities.|
|[`seedAttributes`](#)|A script that seeds information about the files before they are selected.|
|[`preprocessFiles`](#preprocessFiles%3A-(optional))|A script that lets you post-process the results of the upload. It can be used to do things, such as relating the uploaded files to other entities, such as assets.|
|[`processUploadFile`](#processUploadFile%3A-(optional))|A script that allows you to modify the file’s name after the user has selected attributes in the upload table but before the file is uploaded.|
|[`postProcessFiles`](#postProcessFiles%3A-(optional))|A script that runs after the user has selected files from disk but before the file appears in the upload table.|
|[`downloadReport`](#downloadReport%3A-(optional))|A script that downloads an XLSX report of the uploaded files and their attributes if the user clicks the **Report** button.|

---

## `pageComponent`

Use `'pageComponent: 'files/UploadFilesWizard'` in a handler to activate the Dashboard View.

This view is designed to allow uploading files into the root container of a project. Optional script hooks are provided to allow the customization of file attribute, file naming, and post-processing of the upload results.

---

## `config`

### `displayNameMap` (required)

```jsx
displayNameMap: 'iaf_attributeDisplayNames',
```

The display name map is a map between the `fileAttribute` camelCase property name (on the `fileAttributes` object) and the display name for the attributes. This is usually defined and loaded in the user’s file script.

### `columns` (required)

```jsx
columns: [
 {
    name: ['dtCategory', 'dtType'],
    query: {
      query: "<<SCRIPTED_LINKED_SELECTS>>",
      selects: [
        {display: "dtCategory", script:"getDtCategories"},
        {display: "dtType", script:"getDtTypes"}
     ]}
 },
 {name: 'building', query: "<<SIMPLE_SELECT>>", script: 'getBuildings'},
 {name: 'contributor', query: "<<SIMPLE_SELECT>>", script: 'getContributors', required: true},
 {name: 'documentType', query: "<<SIMPLE_SELECT>>", script: 'getDocTypes', required: true},
 {name: 'fileDiscipline', query: "<<SIMPLE_SELECT>>", script: 'getFileDiscs', required: true},
 {name: 'fileType', query: "<<SIMPLE_SELECT>>", script: 'getFileTypes'},
 {name: 'levelsAndLocations', query: "<<SIMPLE_SELECT>>", script: 'getLevsAndLocs'},
 {name: 'manufacturer', query: "<<CREATABLE_SCRIPTED_SELECTS>>", script: 'getFileManufacturers'},
 {name: 'originator', query: "<<SIMPLE_SELECT>>", script: 'getOriginators', required: true},
 {name: 'revision', query: "<<CREATABLE_SCRIPTED_SELECTS>>", script: 'getRevisions'},
 {name: 'stageDescription', query: "<<SIMPLE_SELECT>>", script: 'getStageDescs'}
]
```

`columns` defines the file attribute columns the user should see in the upload table. These will be the attributes for which the user can provide values.

Each column includes:

- `name`: (required) - the camelCase name of the `fileAttrbiute`. In the case of linked values, such as `dtCategory` and `dtType`, this should be the ordered list of the attribute names represented.
- `query`: (required) - the UI component to use to display in the table to allow users to select a value for the attribute.
- `script`: (required) - the script to use to fetch the values to display in the UI control defined by the query.
- `required`: (optional) - indicates if the file attribute must have a value set before the file can be uploaded.

### `scripts` (required - but can be an empty object)

```jsx
scripts: {
  seedAttributes: "seedAttributes",
  preprocessFiles: "preprocessUploadFiles",
  processUploadFile: "processUploadFile",
  postprocessFiles: "postprocessUploadFiles",
  downloadReport: "downloadFileUploadReport"
},
```

`scripts` provides hooks to customize the user’s upload experience, modify the files before upload, and to post-process the results of the upload to do things, such as relating files to entities.

The five supported scripts are:

#### `seedAttributes`: (optional)

If provided, a script that seeds information about the files before they are selected.

#### `preprocessFiles`: (optional)

If provided, this script will be run after the user has selected files from disk but before the file appears in the upload table. This script can be used to do things like look to see if the file has already been uploaded and pre-populate the file attributes on the file, parse the file name to extract attribute values to pre-populate file attributes, check file names against a list of expected file names, and even reject files from the upload.

The script is passed an array of `<Files>` as `$files`. The script must return two lists of files: `accepted` and `rejected`.

Accepted files can have to follow information appended by the script:

- It can add an `overrideName` property to a file to change the name the file will have when it is uploaded (and the name which will appear in the upload table)

- It can add a `fileItem` property and within that a `fileAttributes` object that contains prepopulated `fileAttribute` values.

Sample script result:

```jsx
{
  accepted: [
    {
      name: "Original File Name.pdf",
      overrideName: "My new file name.pdf",
      fileItem: {
        fileAttributes: {
          building: "Super Market",
          originator: "Scott Mollon Co."
        }
      }
    }
  ],
  rejected: [
    {
      name: "Original Rejected File Name.pdf",
    }
  ]
}
```

#### `processUploadFile`: (optional)

If provided, this script allows you to modify the file’s name after the user has selected attributes in the upload table but before the file is uploaded.

The script is handed the internal representation of the file in the upload table including the `fileAttributes` in `$file`. The script must return either a string or `null` value.

#### `postProcessFiles`: (optional)

If provided, this script lets you post-process the results of the upload. It can be used to do things, such as relating the uploaded files to other entities, such as assets.

The script is handed the type of entities that the page may have received in `$entityType`, an array of the entities in `$entities`, and the newly created uploaded file items in `$fileItems`.

The script does not return anything.

#### `downloadReport`: (optional)

If provided, this script downloads an XLSX report of the uploaded files and their attributes if the user clicks the **Report** button. If the script is not provided the **Report** button will not appear for the user.

The script receives an array of arrays in `$tableRows`, which represent the rows and cells for an XLSX export.

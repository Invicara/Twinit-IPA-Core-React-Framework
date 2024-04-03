---
title: Entity View
sidebar_position: 1200
---

## Entity View Configuration

## `type`

**Required** Specify the singular and plural name of the objects being represented in the EntityView. This will be used in the user interface to indicate which objects a user is viewing and acting on.

```jsx
type: {
  singular: "Asset",
  plural: "Assets"
},
```

#### Configuration

- `singular`: the singular name of the objects.
- `plural`: the plural of the objects.

#### Use Case

If you have a People register, you would set singular to 'Person' and plural to 'People'.

## `entityData`

**Required** Specifies the script to use to fetch entities to display in the entityView.

```jsx
entityData: {
    Asset: {
    script: "getAssets"
  }
},
```

#### Configuration

- `script`: the name of the script to call to fetch entities. Accepts `{entityInfo: {}}`

:::note
The property name must match `type.singular`. The script must also return Entities which contain these properties:
:::

```jsx
{
  id: <unique string>
  "Entity Name": <string>
  properties: [
    <array of properties>
  ]
}
```
---
## `selectBy`

**Optional (if using `entitySelectByConfig`)** Specify the ways in which the user can find entities. This controls which options appear in and are used by the Fetch button. If using `entitySelectByConfig`, providing selectBy configuration here will override the top level config in `entitySelectByConfig`.

By setting this option you can control what options a users has for finding entities on the backend.

```jsx
selectBy: [
  {
    id: 'assetfloorandroom',
    query: "<<SCRIPTED_SELECTS>>",
    display: "Floor and Room",
    script: "getFloorRoomPropSelects",
    multi: true,
    op: '$and'
  },
  {
    id: 'assetsearch',
    query: "<<TEXT_SEARCH>>",
    display: "Quick Search"
  }
],
```
#### Configuration

An array of control configurations. Each control configuration can vary based on the type of control being used. Controls are displayed in the order they are configured. All control configurations will include at a minimum:

|Name|Description|
|---|---|
|`query`|The name of the control to display.|
|`display`|The label to display with the control in the UI.|
|`id`|A unique identifier for the control which will be the same across all pages in the DBM for that control.|

Many control configurations will require additional configuration information. See below for configurations for specific controls.

## `tableView`

#### Example:

```jsx
"tableView": {
  "component": {
    "name": "EntityListView",
    "className": "entity-list-view-default",
    "multiselect": true,
    "columns": [
      {
        "name": "Name", 
        "accessor": "Entity Name"
      },
      {
        "name": "Floor", 
        "accessor": "properties.Floor"
      },
      {
        "name": "Room",
        "accessor": "properties.Room"
      }
   ]
 }
}
```

#### Configuration

|Name|Description|
|---|---|
|`component`| Configuration for the component to use when display the tableView|
|`name`| Name of the code level component|
|`className`| The className to apply to the top level DOM node of the component|
|`multiselect`| Whether to allow multiselect check boxes in the table|
|`columns`| An array of column definitions|
|`name`| The name of the column to appear in the table header|
|`accessor`| How to access the value of the on the Entity to display in the cell|

---

## Actions

### `actionName`

**Required** The actions option defines for the page how to perform actions on entities. This will include required actions like how to fetch Entities from the server and also custom actions like how to delete, edit, or copy an entity (or other actions that one can think up). Example actions will be in rows below. The examples are all usable examples, but also illustrate how new actions can be configured to support things like Copy, Export, etc...

#### Example
```jsx
"actions": {
  "actionName": {
    "allow": true,
    "type": "read",
    "icon": "fas fa-edit",
    "showOnTable": true,
    "script": "thisIsHowYouDoThis"
  }
}
```

#### Configuration

|Name|Description|
|---|---|
|`key`| The name of an action and it's configuration|
|`allow`| Whether to allow the user to do the action or not. Boolean|
|`type`| The type of the action, so the UI knows how to update the asset after the action has taken place. Valid values: read, create, edit, delete|
|`icon`| The icon to use if the action will show up in a button on the entity. Any free font awesome icon can be used|
|`showOnTable`| Whether the action should be shown on the summary Table view of entities. These actions must be configured with a script which takes an array of entities in the originalEntities paramater|
|`script`| The name of the script to be run to accomplish the action. The script will be passed the entity on which the the action was invoked|

:::note
The above is the basic config for any action. Some actions may require more configuration.
:::

When determining which actions should appear on an entity, the entire list of actions is taken and any action named 'Read' or 'Create' are removed. 'Read' and 'Create' are used by the page as whole, and not by individual assets.

## `Edit`

**Optional** This action allows a type of edit on an entity where the user is presented with a dialog with all asset properties.

```jsx
"actions": {
  "Edit": {
    "allow": true,
    "icon": "fas fa-edit,"
    "type": "edit",
    "script": "editAsset",
    "showOnTable": false,
    "component": {
        "name": "AssetModal",
        "disabled": ["Asset Tag"],
        "disabledInMulti": ["Unique Asset Prop"],
        "okButtonText": "Save"
    }
  }
}
```

### Configuration

|Name|Description|
|---|---|
|`type`| 'Edit' is needed to let the UI know how to handle the result of the action|
|`script`| The script name that knows how to edit the entity. This includes how to update extended data which are not directly linked to the asset itself|
|`component`| The component to use to accomplish the edit (or action). In this case using the `AssetModal`.
|`component.name`| The name of the component to use for the action|
|`component.disabled`| A list of properties to disable editing of in the dialog|
|`component.disabledInMulti`| A list of properties to disable editing of in the dialog while editing multiple entities at once|
|`component.disableAll`| (not shown) A shortcut to disable all properties in the dialog. Used in Delete below|
|`component.okButtonText`| The text to show on the "OK" button in the modal|

### Use Case

When the user clicks the edit icon on the asset, the AssetModal is presented to the user. The Asset Tag property is not able to be edited however all other properties are.
When the user clicks the edit icon while multiple assets are selected, the user is presented with the  Asset Modal. The Asset Tag and the Unique Asset Prop fields will be disabled.

## `Delete`

**Optional** This action allows a user to delete an entity. It presents the AssetModal in read only mode, so the user can see all asset properties prior to deleting the asset.

```jsx
"actions": {
  "Delete": {
    "allow": true,
    "icon": "fas fa-trash-alt",
    "type": "delete",
    "script": "deleteAsset",
    "showOnTable": false,
    "component": {
        "name": "AssetModal",
        "disableAll": true
    }
  }
}
```
### Configuration

|Name|Description|
|---|---|
|`type`| 'Delete' is needed to let the UI know how to handle the result of the action|
|`script`| The script name that will be executed once the action has ran|
|`component`| The component to use to accomplish the deletion (or action). In this case using the `deleteAsset`
|`component.name`| The name of the component to use for the action|
|`component.disableAll`| A shortcut to disable all properties in the dialog.|

---

## Entity Extended Data

**Optional, but Required if you wish to show Entity properties or if the Entities have extended data** The data options allows for specifying the extended data that should be displayed on the entities, how to get that extended data for the entity, and how to display the extended data on the entity.

```jsx
data: {
  "extended data name": {
    "script": "getAddlData",
    "scriptExpiration": 12,
    "refreshInterval": 13,
    "selected": false,
    "isProperties": false,
    "component": {
      "name": "SimpleTable",
      "className": "simple-property-grid simple-property-grid-header"
    }
  },
}
```

:::note
Example extended data will be in the rows below.

This only example data though, and we are not limited to only the types of data in the examples. We can support many types of data following the extended data configuration pattern.
:::

### Configuration

|Name|Description|
|---|---|
|`key`| The name of the type of extended data. This name will show up as the tab name displaying the extended data|
|`script`| The name of the script which will fetch the extended data. The script will be given for the entity to use to find the data. This script is called when the tab for the extended data is clicked. The script must return the data in a form the following component can use|
|`scriptExpiration`| The amount of minutes you want the script result to be cached. If this field is not present, the default expiration will be 10 minutes. If the value is 0, the script will not be cached|
|`refreshInterval`| If you wish for the data to auto refresh, set refreshInterval to the time in minutes in which you would like the data to continually refresh. Note that this time must be longer than 10 minutes or the configured scritpExpiration|
|`isProperties`| If this data configuration represents properties directly on the Entity`selected`: if the Properties should be displayed by default when the asset is viewed|
|`component`| The component to use to display the data. The options will vary based on the component|
|`component.name`| Name of the component|
|`component.className`| Any additional classNames to use with the component|

## `Properties`

**Most likely required.** Configuration for displaying the entity properties.

```jsx
"data": {
  "Properties": {
    "selected": true, 
    "isProperties": true,
    "component": {
      "name": "SimpleTableGroup",
      "tableClassName": "simple-property-grid",
      "groupClassName": "simple-grouping-titles",
      "groups": {
        "Common": [
          "Floor",
          "Mark",
          "Room"
        ],
        "Product": [
          "Manufacturer",
          "Model",
        ]
      },
    }
  }
}
```

### Configuration

|Name|Description|
|---|---|
|`isProperties`| If this data configuration represents properties directly on the Entity `selected`: if the Properties should be displayed by default when the asset is viewed|
|`component`| The component and component options to use to display the properties
|`groups`| Used with SimpleTableGroup to specify the grouping. Remaining data is placed in a group called Other|
|`tableClassName`| The styling for the tables|
|`groupClassName`| The styling for labeling the group|


## `Specifications`

This configuration displays Specification data on the entity found and formatted by the 'getSpecDataForAsset' script. The data is displayed in a SimpleTable.

```jsx
"data": {
  "Specifications": {
    "script": "getSpecDataForAsset",
    "showCount": false,
    "component": {
      "name": "SimpleTable",
      "className": "simple-property-grid simple-property-grid-header"
     }
  },
}
```

### `Files`

This configuration displays the files which are linked to the entity and fetched using the `getDocumentsForAsset` script. This script returns an array of `fileItems`. The columns option is used to create a `SimpleTable` using the array of `fileItems`.

```jsx
"data": {
  "Files": {
    "script": "getDocumentsForAsset",
    "showCount": true,
    "component": {
      "name": "SimpleTable",
      "className": "fixed-header simple-doc-table",
      "columns": [
        {"name": "Name", "accessor": "name", "download": true},
        {"name": "Description", "accessor": "fileAttributes.description"},
        {"name": "Type", "accessor": "fileAttributes.fileType"},
        {"name": "Phase", "accessor": "fileAttributes.buildingPhase"}
       ]
     }
  },
}
```

### Configuration

|Name|Description|
|---|---|
|`columns`| An array of column objects|
|`name`| The name to display at the top of the column in the header|
|`accessor`| How to find the value to display in the cell on the objects in the array|
|`download`| Whether to use this cell as a download cell for the document|

## `entitySelectionPanel`

This configuration allows to specify certain desired configurations of the entity selection panel inside an entity view.

```jsx
"entitySelectionPanel": {
  "nonFilterableProperties": [
    "Date"
  ],
  "nonGroupableProperties": [
    "Date",
    "DateTime"
  ],
  "defaultGroups": ["Room"]
}
```

### Configuration

|Name|Description|
|---|---|
|`nonFilterableProperties`| Array that specifies which properties a user will not be able to filter by (they won’t be displayed)|
|`nonGroupableProperties`| Array that specifies which properties a user will not be able to group by (they won’t be displayed)|
|`defaultGroups`| Array that will specify which groups a user will see selected by default, inside the group dropdown|

:::note
If the user has changed groups, the last used group per entity type will be used by default. If there was no previous selected group, or all the groups were removed, the default group will be used
:::

---

### Supported Components

#### SimpleTable
Table layout for displaying data

##### Configuration
|Name|Description|
|---|---|
|className (optional)| CSS class name that will be applied to the table.  Currently supported values:<br> - Fixed-header:  keep the header visible and scroll just the table body<br>- Simple-doc-table: designed for an array of objects <br>- Simple-property-grid: designed for listing the properties of a single object|
|columns (optional)|When passing in an array of objects use the columns array to identify what object properties to include in the table.  Each entry in the columns array is an object that specifies the name for the column, how to access the data and whether or not the column contains a download link.|

##### Examples:
```jsx
"component": {
  "name": "SimpleTable",
  "className": "simple-property-grid"
}

"component": {
  "name": "SimpleTable",
  "className": "fixed-header simple-doc-table",
  "columns": [
    {"name": "Name", "accessor": "name", "download": true},
    {"name": "Discipline", "accessor": "fileAttributes.fileDiscipline"},
    {"name": "Type", "accessor": "fileAttributes.fileType"},
    {'name': "Stage", "accessor": "fileAttributes.stageDescription"}
  ]
}
```
#### SimpleTableGroup
A group of tables

##### Configuration
|Name|Description|
|---|---|
|tableClassName(optional)|CSS class for the table (see SimpleTable for details)|
|groupClassName(optional)|CSS for group headers|
|groups|An object containing arrays of properties for each group. Any properties that are not listed will be included in a group called “Other”.  The “Other” group will be sorted alphabetically, the other groups will present the properties in the order listed.|

##### Example:
```jsx
"component": {
  "name": "SimpleTableGroup",
  "tableClassName": "simple-property-grid",
  "groupClassName": "simple-grouping-titles",
  "groups": {
    "Common": [
      "Floor",
      "Mark",
      "Room"
    ],
    "Product": [
      "Manufacturer",
      "Model",
    ]
  },
}
```

#### SimpleTabbedTable
A simple table that includes tabs.

|Name|Description|
|---|---|
|isProperties|If this data configuration represents properties directly on the Entity`selected`: if the Properties should be displayed by default when the asset is viewed.|
|groupClassName(optional)|CSS for group headers.|
|hidden|An array of items we do not want to display in the "Other" tab.|
|groups|An object containing arrays of properties for each group. Each key in this object represents a tab. Any properties that are not listed will be included in a group called “Other”.  The “Other” group will be sorted alphabetically, the other groups will present the properties in the order listed.|

##### Example:
```jsx
"Asset": {
  "Asset Properties": {
    "selected": true,
    "isProperties": true,
    "component": {
      "name": "SimpleTabbedTable",
      "className": "assert-properties-tabbed-table",
      "groupClassName": "simple-table-group-name",
      "hidden": [
        "Scan View",
        "Asset Photo",
        "Was it in AIR",
        "Virtual Asset",
        "Drawing",
        "BA Asset Type",
        "Asset Type",
        "Asset SubType",
        "Fire Rating",
        "baUniclass2015",
        "baUniclass2015Name",
        "Revit Family",
        "Revit Type",
        "revitGuid",
        "revitId",
        "PDTD"
      ],
      "groups": {
        "Asset Properties": [
          "Containing Floor",
          "Mark",
          "Room Number",
          "BA Name"
        ],
        "Product": [
          "Manufacturer",
          "Model"
        ],
        "Classification": [
          "Revit Family",
          "Revit Type",
          "dtCategory",
          "dtType"
        ],
        "General": [
          "Date",
          "Image Url",
          "Matterport Url"
        ]
      }
    }
  }
}
```

#### Image
A simple image component.

##### Configuration
|Name|Description|
|---|---|
|script (optional if providing url or filename)|A script which returns a url or filename of the image.|
|filename (optional)|The filename of the image file.|
|url (optional)|A url to an image.|
|styles (optional)|Additional styles to apply to the image (will need all three in the example below for the image to display correctly).|
|navigateTo (optional)|The name of handler to navigate to when the image is clicked.|

##### Example:
```jsx
"Image": {
   "selected": true,
   "script": "getAssetImage",
   "component": {
     "name": "Image",
     "styles": {
       "backgroundPosition": "center",
       "backgroundSize": "contain",
       "minHeight": '100'
    }
  }
},
```
#### ScriptedChart

A chart component allowing for chart display based on configuration and scripted data.
|Name|Description|
|---|---|
|script (required)|Script used to return the data needed for the chart to display|
|chart|Type of chart to be rendered|
|chartConfig|Config specific to the chart we want to display|

##### Example:
```jsx
"Chart": {
  "script": "getCapExForecast",
  "component": {
    "name": "ScriptedChart",
    "chart": "Bar",
    "style": {
      "height": "300px"
    },
    "chartConfig": {
      "colors": [
        "#C52083"
      ],
      "padding": 0.4,
      "enableLabel": false,
      "enableGridY": false,
      "margin": {
        "top": 60,
        "bottom": 40
      },
      "axisBottom": {
        "tickSize": 0,
        "tickPadding": 10
      },
      "iceTitle": "Testing Bar Chart"
    }
  }
}
```

#### ScriptedDocumentTable


##### Example

```jsx 
"Files": {
  "script": "getDocumentsForAsset",
  "scriptExpiration": 0,
  "showCount": true,
  "component": {
    "name": "ScriptedDocumentTable",
    "className": "fixed-header simple-property-grid",
    "canDownload": true,
    "canView": true,
    "includeVersions": true,
    "columns": [
      {
        "name": "id",
        "accessor": "_id"
      },
      {
        "name": "Contributor",
        "accessor": "properties.Contributor"
      },
      {
        "name": "Building",
        "accessor": "properties.Building"
      },
      {
        "name": "File Type",
        "accessor": "properties.File Type"
      }
    ],
    "defaultSort": {
      "column": "name",
      "descending": false
    },
    "lockedColumns": [
      "Version",
      "Contributor"
    ],
    "dateField": "_updatedAt",
    "supportedTypes": [
      "pdf",
      "jpg",
      "png",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "dwg"
    ]
  }
}
```

##### Configuration
|Name|Description|
|---|---|
|`script`|`getDocumentsForAsset`|
|`name`| Name of the code level component|
|`className`| The className to apply to the top level DOM node of the component|
|`canDownload`|Option to allow a user to download the file. Boolean|
|`canView`|Option to allow a user to view the file via `Document Viewer`. Boolean|
|`includeVersions`|Option to allow a user to access older versions of a file. Boolean|
|`columns`| An array of column definitions|
|`name`| The name of the column to appear in the table header|
|`accessor`| How to access the value of the on the Entity to display in the cell|
|`defaultSort.column`|Select the file attribute in which we want to sort by|
|`lockedColumns`|Option to lock a column so a user cannot hide them|
|`dateField`|Provide the file attribute to be used to display when the version of the file was uploaded|
|`supportedTypes`|An array of supported file types|


#### StandaloneDocumentTable

##### Example
```jsx
 "FilesStandalone": {
        "script": "getDocumentsForAsset",
        "scriptExpiration": 0,
        "showCount": true,
        "component": {
          "name": "StandaloneDocumentTable",
          "className": "fixed-header simple-property-grid",
          "canDownload": true,
          "canView": true,
          "includeVersions": true,
          "columns": [
            {
              "name": "id",
              "accessor": "_id"
            },
            {
              "name": "Contributor",
              "accessor": "properties.Contributor"
            },
            {
              "name": "Building",
              "accessor": "properties.Building"
            },
            {
              "name": "File Type",
              "accessor": "properties.File Type"
            }
          ],
          "defaultSort": {
            "column": "name",
            "descending": false
          },
          "lockedColumns": [
            "Version",
            "Contributor"
          ],
          "dateField": "_updatedAt",
          "supportedTypes": [
            "pdf",
            "jpg",
            "png",
            "doc",
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "pptx",
            "dwg"
          ]
        }
      }
```
##### Configuration
|Name|Description|
|---|---|
|`script`|`getDocumentsForAsset`|
|`name`| Name of the code level component|
|`className`| The className to apply to the top level DOM node of the component|
|`canDownload`|Option to allow a user to download the file. Boolean|
|`canView`|Option to allow a user to view the file via `Document Viewer`. Boolean|
|`includeVersions`|Option to allow a user to access older versions of a file. Boolean|
|`columns`| An array of column definitions|
|`name`| The name of the column to appear in the table header|
|`accessor`| How to access the value of the on the Entity to display in the cell|
|`defaultSort.column`|Select the file attribute in which we want to sort by|
|`lockedColumns`|Option to lock a column so a user cannot hide them|
|`dateField`|Provide the file attribute to be used to display when the version of the file was uploaded|
|`supportedTypes`|An array of supported file types|

---
## How to load your own component

Your own custom Entity Data component can be added to your project. Firstly, The custom component can be created and saved in ipaControls and then imported into the 'entityUI.js' file. The custom Entity Data component you want to create must be added to the ENTITY_DATA_COMPONENTS object in the 'entityUI.js' file as shown below.

```jsx
const ENTITY_DATA_COMPONENTS = {
  ......
  "SimpleCustomTable": SimpleCustomTableFactory,
}
```
From here, we can use the component by adding it to the appropriate location in the userConfig JSON file. For example, if we wanted to use this custom table component to view all documents that related to a collection.

```jsx
"Documents": {
  "script": "getDocumentsForCollectionExtendedData",
  "scriptExpiration": 0,
  "component": {
    "name": "SimpleCustomTable",
    "className": "fixed-header simple-property-grid",
    "columns": [
      {
        "name": "Name",
        "accessor": "name"
      },
      {
        "name": "Contributor",
        "accessor": "fileAttributes.contributor"
      },
      {
        "name": "Document Type",
        "accessor": "fileAttributes.documentType"
      }
    ]
  }
}
```

---
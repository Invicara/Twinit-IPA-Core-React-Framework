---
title: Top-Level User Configuration
sidebar_position: 700
---
This topic describes top-level user configurations.

|Configuraion|Description|
|------------|-----------|
|[`pages`](#pages)|Specifies which pages display in the left navigation bar.|
|`handlers`|Specifies the configuration options needed for the application to display the page.|
|[`onConfigLoad`](#onconfigload)|Loads and executes scripts when the User Config is loaded into the application.|
|[`entitySelectConfig`](#entityselectconfig)|Defines the controls to be used across all pages for searching each entity type.|
|[`selectBy`](#selectby)|Specifies a set of controls that can be used to query data on the backend.|
|[`<<TEXT_SEARCH>>`](#text_search)|Allows quick searching of indexed fields of entity objects.|
|[`<<ADVANCED_SEARCH>>`](#advanced_search)|Allows searching on the specified properties.|
|[`<<SCRIPTED_SELECTS>>>`](#scripted_selects)|Displays one or more drop-down lists populated with data from a script.|
|[`<<SCRIPTED_LINKED_SELECTS>>`](#scripted_linked_selects)|Displays a set of drop-down lists where the values of the next drop-down list |re determined based on the selection in the current or prior drop-down list(s).
|[`<<TREE_SEARCH>>`](#tree_search)|Displays a tree with as many levels as specified, grouping and subgrouping by |ifferent entity properties.
|[`settings`](#settings)|Controls project-wide top-level flags for features.|
|[`entityDataConfig`](#entitydataconfig)|Defines the extended data to be used by each entity type.|

## `pages`

`pages` specifies which pages display in the left navigation bar.

```jsx
pages: {
    assets: {
      handler: 'assets',
      position: 0
    },
    models: {
      handler: 'models',
      position: 2
    }
    ...
    reports: {
      handler: 'reports',
      position: 5
    },
  },
```

### Configuration

- `key`: the name of a page to display in the left navigation bar
- `handler`: the page handler that specifies the configuration options for a specific page
- `position` (optional): the order in which the pages should appear 
- `icon`: the grouped pages will display this icon on the left navigation bar and at the top of the group. Inside each group, the pages will have the regular icons related to each handler.

### Notes

If `position` is not provided, the pages will be presented in alphabetical order.

Optionally, the pages on the left navigation bar can appear grouped, using the following configuration:

```json
"groupedPages": {
  "entities": {
    "icon": "inv-icon-svg inv-icon-assets",
    "position": 1,
    "pages": [
      {
        "page": "assets",
        "handler": "assets",
      },
      {
        "page": "spaces",
        "handler": "spaces",
      }
      ]
  },
  "other": {
    "icon": "inv-icon-svg inv-icon-nav",
    "position": 2,
    "pages": [
      {
        "page": "navigator",
        "handler": "navigator",
      },
      {
        "page": "fileUpload",
        "handler": "fileUpload",
      }
    ]
  }
},
```
---

## `handlers`

A page handler specifies the configuration options needed for the application to display the page. These configurations are for all pages in the application, whether or not they appear in the left navigation bar and the pages.

This is a generic page handler with only the basic configuration needed for a page.

```jsx
handlers: {
  documents: {
    title: 'Files',
    icon: 'icofont-file-text',
    shortName: 'docs',
    description: 'Facilities Data Management',
    pageComponent: 'FdmView',
    actionHandlers: ['upload'],
    path: '/docs',
    scriptTypes: [
      'iaf_fdm_allusers_scr',
      'iaf_fdm_solman_scr'
    ],
    onHandlerLoad: [
      'loadProjectData'
    ],
    config: {}
  },
}
```

### Configuration

- `key`: a name of a handler.
- `title` (optional) : a title for the page.
- `icon` (optional) : the icon to show in the left navigation bar for the page. This configuration is optional but recommended, as the UI will not display anything for the page when the navigation bar is in the collapsed state.
- `shortName`: a short name for the page.
- `description`: a description of the page.
- `pageComponent`: the component in the application to display as the page.
- `actionHandlers`: an array of other page handlers that should appear as menu options in the top right corner of the page.
- `path`: the URL path to the page. The path must be unique across all page handlers.
- `scriptTypes`: an array of script types to load when the page loads in the application. This can load all logic needed for the page and then supplement and override with other scripts. Scripts are loaded in order and can override previously loaded scripts.
- `onHandlerLoad`: an array of script names to execute after the scripts in `scriptTypes` have been loaded.
- `config` (optional): any configuration needed specific to the `pageComponent` in the handler. This may be required for some `pageComponents` but not others.

### Example

The example above configures the Documents page

- Shows the `FdmView` component allowing the user to view documents in their project.
- Puts a link to the upload page in the top-right menu.
- Loads a script with logic applicable to all users and then supplements with logic that applies to the 'solman' user.

---

## `onConfigLoad`

`onConfigLoad` loads and executes scripts when the user config is loaded into the application.

```jsx
onConfigLoad: {
  load: ['iaf_dt_type_map'],
  exec: ['loadTypeMap']
},
```

### Configuration

- `load`: an array of script file names to be loaded at the time that the project and user config are being loaded
- `exec`: an array of script names to be executed at the time that the project and user config are being loaded

### Example

Load the type map script which controls how to retrieve and format the type map, then execute the script which gets the type map, formats the type map, and makes the type map available in a script variable for pages to use.

### Notes

This avoids every page having to load the same large amount of data.

---

## `entitySelectConfig`

Defines the controls to be used across all pages for searching each entity type.

```jsx
entitySelectConfig: {
  Asset: [
    {
      id: 'assetsearch',
      query: "<<TEXT_SEARCH>>",
      display: "Quick Search"},
    {
      id: 'assetcat', 
      query: "<<SCRIPTED_LINKED_SELECTS>>",
      display: "Category",
      selects: [
        {
          display: "dtCategory",
          script:"getDtCategories"
        },
        {
          display: "dtType",
          script:"getDtTypes",
          multi: true}]
        }
      ]
    }
  ],
  Space: [
    {
      id: 'spacefoorty',
      query: "<<SCRIPTED_SELECTS>>",
      display: "Floor or Type",
      script: "getSpacePropSelects", 
      multi: true,
      op: '$or',
      default: true
    },
    {
      id: 'spacesearch',
      query: "<<TEXT_SEARCH>>",
      display: "Search"
    },
  ]
},
```

### Configuration

Each property on `entitySelectConfig` should match one of the singular types on any page's config.

For example, if the entity has:

```jsx
config: {
    type: {
        singular: 'Asset',
        plural: 'Assets'
    }
}
```

then `entitySelectConfig` should also have a property named 'Asset'. See the `selectBy` Configuration for a description of how to configure the controls.

---

## `selectBy`

`selectBy` specifies a set of controls that can be used to query data on
the backend.

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

### Configuration

An array of control configurations. Each control configuration can vary based on the type of control being used.

Controls are displayed in the order they are configured.

All control configurations will include at a minimum:

- `query`: the name of the control to display
- `display`: the label to display with the control in the UI
- `id`: a unique identifier for the control which will the same across all pages in the DBM for that control.

Many control configurations will require additional configuration information. See below for configurations for specific controls.

### Example

Provide a quick search, advanced search, and Product dropdowns for users to find data.

## `<<TEXT_SEARCH>>`

Allows quick searching of indexed fields of entity objects. Displays a text field to enter search criteria.

```jsx
{
    id: 'assetsearch',
    query: "<<TEXT_SEARCH>>",
    display: "Quick Search"
}
```

### Configuration

- `id`: a unique identifier for the control which will the same across all pages in the DBM for that control.
- `query`: `<<TEXT_SEARCH>>`
- `display`: the label for the control in the UI

### Notes

A text index must be created on the entity collection in mongoDB as part of the project setup in order for this to work.

## `<<ADVANCED_SEARCH>>`

Allows searching on the specified properties. The search terms can either be combined with an "and" or an "or". The text-based terms can be set to do a case-insensitive search.

Displays the selected search terms and a drop-down list that allows selecting new search terms.

```jsx
{
  id: 'assetadvsrch',
  query: "<<ADVANCED_SEARCH>>",
  display: "Advanced Search",
  searchable:{
    Mark: {type: "text"},
    Manufacturer: {type: "text"},
    Model: {type: "text"},
    Date: {type: "date"},
    WithUnitNumber: {type: "number"},
    'Revit Family': {type: "text"},
    'Revit Type': {type: "text"}
  }
}
```

### Configuration

- `id`: a unique identifier for the control which will the same across all pages in the DBM for that control.
- `query`: `<<ADVANCED_SEARCH>>`
- `display`: the label for the control in the UI
- `searchable`: the list of properties that should be searchable, along with their data type.

## `<<SCRIPTED_SELECTS>>`

Displays one or more drop-down lists populated with data from a script.

The script can create the drop-down data locally or it can do queries on
the back end to retrieve data for the drop-downs.

You may have multiple `<<SCRIPTED_SELECTS>>` in the same array of `selectBy`s, with different configurations.

```jsx
{
  id: 'assetfloorandroom',
  query: "<<SCRIPTED_SELECTS>>",
  display: "Floor and Room",
  script: "getFloorRoomPropSelects",
  altScript: "overrideDefaultSearch",
  multi: true,
  op: '$and'
  selects: [
    {
      display: "Originator",
      propName: "fileAttributes.originator"
    },
    {
      display: "Document Type",
      propName:"fileAttributes.documentType"
    }, 
  ]
}
```

### Configuration

- `id`: a unique identifier for the control which will the same across all pages in the DBM for that control.
- `query`: `<<SCRIPTED_SELECTS>>`
- `display`: the label for the control in the UI
- `script`: the name of the script to run to retrieve data for the dropdowns
- `altScript`: (optional, version 0.6+) a script to override the default entity search. It receives the raw values of the select and must return entities.
- `multi`: whether the dropdowns should support multi-select.
- `op`: if multiple dropdowns are returned by the script, whether to do an 'AND' or an 'OR' between the values the user selects in the dropdowns. Allowed values are `$and` or `$or`.
- `selects` (optional, version 0.5+): a list of the linked dropdowns to display and the property names to use to query them. Use this to be able to query objects that do not match the Entity data model (such as file items).
- `select.display` ( version 0.5+): the property or label for the linked drop-down list.
- `select.propName` ( version 0.5+): the name of the property to use when creating the backend query.

### Example

The example provides two drop-down lists for the user to select one or more Floors and one or more Rooms, and will query entities that have both those Floors AND Rooms.

```jsx
{
  Floor: ['First Floor', 'Second Floor', 'Dungeon'],
  Room: ['1', '2', '11', '12', 'Cell A', 'Cell B']
}
```

### Notes

The script must return data in a specific format. A javascript object should be returned where the keys are the property names and the values are arrays of potential values for the user to select.

## `<<SCRIPTED_LINKED_SELECTS>>`

`<<SCRIPTED_LINKED_SELECTS>>` displays a set of drop-down lists where the values of the next drop-down list are determined based on the selection in the current or prior drop-down list(s).

Since the selections are dependent on the selections in drop-down lists prior, all queries are 'AND's between drop-down list selections.

```jsx
{
  id: 'assetproducts',
  query: "<<SCRIPTED_LINKED_SELECTS>>",
  altScript: "overrideDefaultSearch",
  display: "Products",
  selects: [
    {
      display: "dtCategory",
      script:"getCategories"
    },
    {
      display: "Manufacturer",
      script:"getManufacturers"
    }, 
    {
      display: "Model",
      script: "getModels", isMulti: true
      propName:"fileAttributes.model"
    }
  ]
}
```

### Configuration

- `id`: a unique identifier for the control which will the same across all pages in the DBM for that control.
- `query`: `<<SCRIPTED_LINKED_SELECTS>>`
- `altScript`: (optional, version 0.6+) a script to override the default entity search. It receives the raw values of the select and must return entities.
- `display`: the label for the control in the UI
- `selects`: a list of the linked dropdowns to display and the script used to fetch the drop-down list values
- `select.display`: the property or label for the linked drop-down lists.
- `select.script`: the script to use to fetch the drop-down list values. It is passed all prior selections to itself.
- `select.multi:` whether to make the drop-down list multi-select. Only valid on the last select in the chain.
- `select.propName` ( version 0.5+): the name of the property to use when creating the backend query.

### Example

The code snippet above is an example of:

- User sees three dropdown lists. One for `dtCategory`, one for Manufacturer, and one for Model. Only `dtCategory` is enabled.
- The user selects a `dtCategory`, and the Manufacturer drop-down list populates with only Manufacturers found with that `dtCategory`.
- The user selects a Manufacturer, and the Model drop-down list populates with only the Models found with the selected `dtCategory` and selected Manufacturer.
- The user can then select multiple models.

### Notes

The script for each dropdown must return an array of values to display.

### `<<TREE_SEARCH>>`

`<<TREE_SEARCH>>` displays a tree with as many levels as specified, grouping and subgrouping by different entity properties. Subgroups are fetched upon node expansion.

As the selections are dependent on the selections in parent nodes, all queries are 'AND's between parent-child nodes.

```json
{
  "id": "treesearch",
  "query": "<<TREE_SEARCH>>",
  "display": "Tree Search",
  "treeLevels": [
      {"property": "dtCategory", "script": "getCategoriesWithCount"},
      {"property": "dtType", "script": "getDtTypes"},
  ]
},
```

### Configuration

- `id`: a unique identifier for the control which will the same across all pages in the DBM for that control.
- `query`: `<<TREE_SEARCH>>`
- `display`: the label for the control in the UI
- `treeLevels`: a list of the grouping levels the tree must have
- `treeLevels.property`: the name of the entity property that level grouping corresponds to
- `treeLevels.script`: the name of the script used to retrieve the options for the category, along with the elements count.

### Example

The example above displays:

- User a tree displaying different asset `dtCategories`, for example "Door-Internal," "Door-External", "Window-External"
- The user expands one `dtCategory` branch and the children `dtType`s are loaded.
- The user selects one or many nodes and the assets for those `dtCategories` and `dtTypes` are fetched
- The user can make any combination, such as selecting only the 'Double' `dtType` under 'Door-External' `dtCategory` and the 'Window-External' `dtCategory` to retrieve all external windows

### Notes

The script for each drop-down list must return an array of values to display. Values may be simple strings or an object, such as `{name:..., childCount:...}`, to display the element count next to the node.

## `settings`

`settings` controls project-wide top-level flags for features.

```jsx
settings: {
    show3dModel: false
    appImage: { 
        url: "url to an image online",
        filename: "name fo a file uploaded to project"
    }
}
```

### Configuration

- `show3dModel`: configures whether to show the 3D model popup-button for bringing up the 3D model viewer.
- `appImage` (optional): changes the logo in the top-left corner of the client. This configuration provides a URL or the name of an image file uploaded to the project.

## `entityDataConfig`

`entityDataConfig` defines the extended data to be used by each entity type. If there is no `data` property in an entity config, the configuration defined here is used.

```json
"entityDataConfig": {
  "Asset": {
    "Asset Properties": {
      "selected": true,
      "isProperties": true,
      "component": {
        "name": "SimpleTableGroup",
        "className": "simple-property-grid",
        "groupClassName": "simple-table-group-name",
        "groups": {
          "Asset Properties": [
            "Floor",
            "Mark",
            "Room"
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
            "DateTime",
            "Image Url",
            "Matterport Url",
            "WithUnitNumber",
            "WithUnitText"
          ]
        }
      }
    },
    "Collections": {
      "script": "getCollectionsForAsset",
      "scriptExpiration": 0,
      "component": {
        "name": "SimpleTable",
        "className": "fixed-header simple-property-grid",
        "columns": [
          {
            "name": "Type",
            "accessor": "properties.Type.val"
          },
          {
            "name": "Name",
            "accessor": "Collection Name"
          }
        ]
      }
    },
    "Files": {
      "script": "getDocumentsForAsset",
      "showCount": true,
      "component": {
        "name": "SimpleTable",
        "className": "fixed-header simple-property-grid",
        "columns": [
          {
            "name": "Name",
            "accessor": "name",
            "download": true
          },
          {
            "name": "Discipline",
            "accessor": "fileAttributes.fileDiscipline"
          },
          {
            "name": "Type",
            "accessor": "fileAttributes.fileType"
          },
          {
            "name": "Stage",
            "accessor": "fileAttributes.stageDescription"
          }
        ]
      }
    },
    "Image": {
    "selected": true,
    "script": "getAssetImage",
    "component": {
      "name": "Image",
      "styles": {
        "backgroundPositionX": "center",
        "backgroundSize": "contain",
        "height": "300"
      }
    }
  },
  "Asset Properties": {
    "selected": true,
    "isProperties": true,
    "component": {
      "name": "SimpleTableGroup",
      "className": "simple-property-grid",
      "groupClassName": "simple-table-group-name",
      "hidden": [
        "Scan View Url",
        "Image File Name"
      ],
      "groups": {
        "Asset Properties": [
          "Floor",
          "Mark",
          "Room"
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
          "DateTime",
          "Image Url",
          "Matterport Url",
          "WithUnitNumber",
          "WithUnitText"
        ]
      }
    }
  },
  "Scan View": {
    "script": "getMatterportConfig",
    "component": {
      "name": "MatterportViewer",
      "config": {
        "height": "600",
        "options": {
          "brand": 0,
          "help": 0,
          "qs": 0,
          "f": 0,
          "vr": 0,
          "mls": 0,
          "hr": 0,
          "gt": 0,
          "play": 1
        }
      }
    }
  },          
  },
  "Space": {
    "Properties": {
      "selected": true,
      "isProperties": true,
      "component": {
        "name": "SimpleTableGroup",
        "className": "simple-property-grid",
        "groupClassName": "simple-table-group-name",
        "groups": {
          "Space Properties": [
            "Floor",
            "Number",
            "Type",
            "Area"
          ]
        }
      }
    }
  }
}
```

### Configuration

Each property on `entityDataConfig` should match one of the singular types on any page's configuration.

For example, if an entity has:

```json
"config": {
  "type": [
    {
      "singular": "Asset",
      "plural": "Assets"
    },
    {
      "singular": "Space",
      "plural": "Spaces"
    }
  ]
}
```

then `entityDataConfig` should have a property named "Asset" and also one called "Space".

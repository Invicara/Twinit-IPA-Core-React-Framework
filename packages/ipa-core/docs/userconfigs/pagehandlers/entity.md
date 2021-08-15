---
title: Entity View
sidebar_position: 12
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

### Configuration

- `singular`: the singular name of the objects.
- `plural`: the plural of the objects.

### Use Case

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

### Configuration

- `script`: the name of the script to call to fetch entities. Accepts `{entityInfo: {}}`

### Notes
The property name must match `type.singular`. The script must also return Entities which contain these properties:

```jsx
{
  "Entity Name": <string>
  properties: [
    <array of properties>
  ]
}
```

## `selectBy`

**Optional (if using `entitySelectByConfig`)** Specify the ways in which the user can find entities. This controls which options appear in and are used by the Fetch button.If using `entitySelectByConfig`, providing selectBy configuration here will override the top level config in `entitySelectByConfig`.

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

See the selectBy Configuration section below for details on configuring the selectBy control and the supported controls.

### Use Case

By setting this option you can control what options a users has for finding entities on the backend.

## `tableView`

Configuration for displaying the summary table view.

```jsx
tableView: {
  component: {
    name: "EntityListView",
    className: "entity-list-view-default",
    multiselect: true,
    columns: [
      {
        name: "Name", 
        accessor: "Entity Name"
      },
      {
        name: "Floor", 
        accessor: "properties.Floor"
      },
      {
        name: "Room",
        accessor: "properties.Room"
      }
   ]
 }
}
```

### Configuration

- `component`: configuration for the component to use when display the tableView
- `name`: name of the code level component.
- `className`: the className to apply to the top level DOM node of the component.
- `multiselect`: whether to allow multiselect check boxes in the table.
- `columns`: an array of column definitions.
- `name`: the name of the column to appear in the table header.
- `accessor`: how to access the value of the on the Entity to display in the cell.

---

## Actions

## `actionName`

**Required** The actions option defines for the page how to perform actions on entities. This will include required actions like how to fetch Entities from the server and also custom actions like how to delete, edit, or copy an entity (or other actions that one can think up).Example actions will be in rows below. The examples are all usable examples, but also illustrate how new actions can be configured to support things like Copy, Export, etc...

```jsx
actions: {
  actionName: {
    allow: true,
    type: 'read',
    icon: 'fas fa-edit',
    showOnTable: true,
    script: 'thisIsHowYouDoThis'
  }
}
```

## Configuration

:::note
These are the basic config for any action. Some actions may require more configuration.
:::

- `key`: the name of an action and it's configuration.
- `allow`: whether to allow the user to do the action or not. Boolean.
- `type`: the type of the action, so the UI knows how to update the asset after the action has taken place. Valid values: read, create, edit, delete
- `icon`: the icon to use if the action will show up in a button on the entity. Any free font awesome icon can be used.
- `showOnTable`: whether the action shoudl be shown on the summary Table view of entities. These actions must be configured with a script which takes an array of entities in the originalEntities paramater.
- `script`: the name of the script to be run to accomplish the action. The script will be passed the entity on which the the action was invoked.

### Notes

When determining which actions should appear on an entity, the entire list of actions is taken and any action named 'Read' or 'Create' are removed.'Read' and 'Create' are used by the page as whole, and not by individual assets.

## `Edit`

**Optional** This action allows a type of edit on an entity where the user is presented with a dialog with all asset properties.

```jsx
actions: {
  Edit: {
    allow: true,
    icon: 'fas fa-edit',
    type: 'edit',
    script: "editAsset",
    showOnTable: false,
    component: {
        name: "AssetModal",
        disabled: ['Asset Tag'],
        okButtonText: 'Save'
    }
  }
}
```

### Configuration

- `type`: 'edit' is needed to let the UI know how to handle the result of the action.
- `script`: the script name that knows how to edit the entity. This includes how to update extended data which are not directly linked to the asset itself.
- `component`: the component to use to accomplish the edit (or action). In this case using the AssetModal. Other configuration is also provided which the AssetModal accepts:
- `name`: the name of the component to use for the action.
- `disabled`: a list of properties to disable editing of int he dialog.
- `disableAll`: (not shown) a shortcut to disable all properties in the dialog. Used in Delete below.
- `okButtonText`: the text to show on the "OK" button in the modal.

### Use Case

When the user clicks the edit icon on the asset, the AssetModal is presented to the user.The Asset Tag property is not able to be edited however all other properties are.

## `Delete`

**Optional** This action allows a user to delete an entity. It presents the AssetModal in read only mode, so the user can see all asset properties prior to deleting the asset.

```jsx
actions: {
  Delete: {
    allow: true,
    icon: 'fas fa-trash-alt',
    type: 'delete',
    script: "deleteAsset",
    showOnTable: false,
    component: {
        name: "AssetModal",
        disableAll: true
    }
  }
}
```

---

## Entity Extended Data

**Optional, but Required if you wish to show Entity properties or if the Entities have extended data** The data options allows for specifying the extended data that should be displayed on the entities, how to get that extended data for the entity, and how to display the extended data on the entity.

```jsx
data: {
  "extended data name": {
    script: "getAddlData",
    scriptExpiration: 12,
    refreshInterval: 13,
    selected: false,
    isProperties: false,
    component: {
      name: "SimpleTable",
      className: "simple-property-grid simple-property-grid-header"
    }
  },
}
```

:::note
Example extended data will be in the rows below.

This only example data though, and we are not limited to only the types of data in the examples. We can support many types of data following the extended data configuration pattern.
:::

### Configuration

- `key`: the name of the type of extended data. This name will show up as the tab name displaying the extended data.
- `script`: the name of the script which will fetch the extended data. The script will be given the entity to use to find the data. This script is called when the tab for the extended data is clicked. The script must return the data in a form the following component can use.
- `scriptExpiration`: the amount of minutes you want the script result to be cached. If this field is not present, the default expiration will be 10 minutes. If the value is 0, the script will not be cached.
- `refreshInterval`: if you wish for the data to auto refresh, set refreshInterval to the time in minutes in which you would like the data to continually refresh. Note that this time must be longer than 10 minutes or the configured scritpExpiration.
- `isProperties`: if this data configuration represents properties directly on the Entity`selected`: if the Properties should be displayed by default when the asset is viewed
- `component`: the component to use to display the data. The options will vary based on the component. Some simple options may be:
  - `name`: name of the component, currently only SimpleTable is supported
  - `className`: any additional classNames to use with the SimpleTable

## `Properties`

**Most likely required.** Configuration for displaying the entity properties.

```jsx
data: {
  Properties: {
    selected: true, 
    isProperties: true,
    component: {
      name: "SimpleTableGroup",
      tableClassName: "simple-property-grid",
      groupClassName: "simple-grouping-titles",
      groups: {
        Common: [
          "Floor",
          "Mark",
          "Room"
        ],
        Product: [
          "Manufacturer",
          "Model",
        ]
      },
    }
  }
}
```

### Configuration

- `isProperties`: if this data configuration represents properties directly on the Entity`selected`: if the Properties should be displayed by default when the asset is viewed
- `component`: the component and component options to use to display the properties.
  - `groups`: used with SimpleTableGroup to specify the grouping. Remaining data is placed in a group called Other.
  - `tableClassName`: the styling for the tables
  - `groupClassName`: the styling for labeling the group.


## `Specifications`

This configuration displays Specification data on the entity found and formatted by the 'getSpecDataForAsset' script. The data is displayed in a SimpleTable.

```jsx
data: {
  Specifications: {
    script: "getSpecDataForAsset",
    showCount: false,
    component: {
      name: "SimpleTable",
      className: "simple-property-grid simple-property-grid-header"
     }
  },
}
```

### `Files`

This configuration displays the files which are linked to the entity and fetched using the `getDocumentsForAsset` script. This script returns an array of `fileItems`. The columns option is used to create a `SimpleTable` using the array of `fileItems`.

```jsx
data: {
  Files: {
    script: "getDocumentsForAsset",
    showCount: true,
    component: {
      name: "SimpleTable",
      className: "fixed-header simple-doc-table",
      columns: [
        {name: "Name", accessor: "name", download: true},
        {name: "Description", accessor: "fileAttributes.description"},
        {name: "Type", accessor: "fileAttributes.fileType"},
        {name: "Phase", accessor: "fileAttributes.buildingPhase"}
       ]
     }
  },
}
```

### Configuration

- `columns`: an array of column objects.
- `name`: the name to display at the top of the column in the header.
- `accessor`: how to find the value to display in the cell on the objects in the array.
- `download`: whether to use this cell as a download cell for the document.

### Notes

The column objects were patterned directly off of React-Tables column objects.

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

- `nonFilterableProperties`: array that specifies which properties a user will not be able to filter by (they won’t be displayed).
- `nonGroupableProperties`: array that specifies which properties a user will not be able to group by (they won’t be displayed).
- `defaultGroups`: array that will specify which groups a user will see selected by default, inside the group dropdown.

(if the user has changed groups, the last used group per entity type will be used by default. If there was no previous selected group, or all the groups were removed, the default group will be used)

---
title: EnhancedPickListSelect
sidebar_position: 2000
---

This control can be used to display linked pick lists. Linked means that the values of the second pick list is determined by the value selected in the first one. The control also allows the possibility to add new options to a list.

Pick Lists have a type and values properties, and each value has a display and value properties.

### Parent Pick List

A parent pick list will have options that have values that are other pick lists. When we select an option on these lists, we will fetch the pick list with the same type, as the value defined in this option.

```jsx
{
  type: "SystemsCategories",
  values: [
    { display: 'Mechanical', value: 'MechanicalSystems' },
    { display: 'Piping', value: 'PipingSystems' },
    { display: 'Electrical', value: 'ElectricalSystems'}
  ]
},
```

### Leaf pick list

Pick list with only values

```jsx
{
  type: "MechanicalSystems",
  values: [
    { display: 'Exhaust Air', value: 'Exhaust Air' },
    { display: 'Return Air', value: 'Return Air' },
    { display: 'Supply Air', value: 'Supply Air' }
  ]
},
```

In this example, when selecting option ‘Mechanical' on the first select, the second select will have the values of the pick list defined by the type 'MechanicalSystems'

## Configuration Example

```json
"picklistSelectsConfig": {  
  "canCreateItems": true,  
  "pickListScript": "getPickList",  
  "createPickListScript": "updatePickList",  
  "initialPickListType": "SystemsCategories",  
  "selects": [  
    {
      "display": "System Category",
      "createPickListOnUpdate": true
    },
    {
      "display": "System Type",
      "createPickListOnUpdate": false
    }
  ]
}
```

- `canCreateItems` Determines if a creatable select will be displayed, to add new options, instead of a regular select.
- `pickListScript` script to get the picklist options
- `createPickListScript` script that will add options to a picklist, and create a linked picklist if specified.
- `initialPickListType` PickLists are identified by their type. We need to specify the type of the first pick list. The following pick list will be determined by the value of the first one.
- `selects` display: Will define the label of the selectcreatePickListOnUpdate: will define if when adding a new option to a picklist, another linked pick list will be created. This should be true for parent pick lists.

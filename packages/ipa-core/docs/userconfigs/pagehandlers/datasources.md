---
title: Datasources View
sidebar_position: 1000
---

## Prerelease

|Name|Description|
|---|---|
|[`pageComponent`](#pageComponent)|Use `'pageComponent: ‘datasources/DatasourcesView’` in a handler to activate the User Management View.|
|`config.allowManageDatasources`|Boolean - whether a user should be able to edit details like schedules for the Datasources and other operations|

---

## `pageComponent`

Use `'pageComponent: ‘users/UserGroupView’` in a handler to activate the Datasources View.

This view is designed to allow managing the datasources within a project.

## `config`

### `allowManageDatasources` (optional)

```jsx
allowManageDatasources: false,
```

Whether a user should have access to edit or modify datasources and schedules.

### `allowDeleteDatasources` (optional)

```jsx
allowDeleteDatasources: false,
```

Whether a user should have access to delete datasources.

---

## Example

```jsx
userGroup: {
   title: 'Datasources',
   actionTitle: 'Datasources',
   icon: 'ion-gear-a icofont-2x',
   pageComponent: "datasource/DatasourcesView",
   path: '/Datasources',
   config: {
    allowManageDatasources: true,
    allowDeleteDatasources: true
  }
}
```

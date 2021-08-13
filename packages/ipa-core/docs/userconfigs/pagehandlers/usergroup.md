---
title: Upload Files Wizard
sidebar_position: 15
---
**Prerelease**

|**Name**|**Description**|
|---|---|
|[`pageComponent`](#pageComponent)|Use `pageComponent: 'users/UserGroupView'` in a handler to activate the User Management View.|
|`appUrl`|(required) The url path from the basepath for any invite links.|
|`allowUserGroupEdit`|Whether the user should be able to edit a User Group’s name.|
|`allowUserGroupInvite`|Whether the user should be able to invites new and existing user’s the User Groups of which the user is a member.|
|`allowManageInvites`|Whether the user should be able to perform actions on existing invites like deleting and resending.|
|`allowManageUser`|Whether the user should be able to remove user’s from UserGroups.|
|`allowViewPermissions`|Whether the user should be able to view the permissions on UserGroups.|
|`allowManagePermissions`|Whether the user should be able to manage UserGroup permissions. **Currently not yet implemented**|
|`scripts.itemFetchScript`|A script to use to determine the NamedUserItems for which the user can manage permissions. If not provided all the NamedUserItems the UserGroup has access to will be able to be manage.|

---

## `pageComponent`

Use `pageComponent: 'users/UserGroupView'` in a handler to activate the User Management View.

This view is designed to allow managing the users in UserGroups and invites to the UserGroups.

---

## `config`

### `appUrl`

(required)

```jsx
appUrl: '/digitaltwin',
```

The url path from the basepath for any invite links.

Note: currently all invites are sent back to platform instance with the appUrl appended.

### `allowUserGroupEdit`

(optional, default = false) 

```jsx
allowUserGroupEdit: false,
```

Whether the user should be able to edit a User Group’s name.

### `allowUserGroupInvite`

(optional, default = false) 

```jsx
allowUserGroupInvite: false,
```

Whether the user should be able to invites new and existing user’s the User Groups of which the user is a member.

### `allowManageInvites`

(optional, default = false) 

```
allowManageInvites: false,
```

Whether the user should be able to perform actions on existing invites like deleting and resending.

### `allowManageUsers`

(optional, default = false) 

```jsx
allowManageUsers: false,
```

Whether the user should be able to remove user’s from UserGroups.

### `allowViewPermissions`

(optional, default = false) 

```jsx
allowViewPermissions: false,
```

Whether the user should be able to view the permissions on UserGroups.

### `allowManagePermissions`

(optional, default = false) 

```jsx
allowManagePermissions: false,
```

Whether the user should be able to manage UserGroup permissions.

### `scripts.itemFetchScript`

(optional, default = false) 

```jsx
scripts: {
  itemFetchScript: 'fetchNonSystemCollections'
}
```

A script to use to determine the NamedUserItems for which the user can manage permissions. If not provided all the NamedUserItems the UserGroup has access to will be able to be manage.

## Example

```jsx
userGroup: {
   title: 'User Group',
   actionTitle: 'User Group Actions',
   icon: 'ion-gear-a icofont-2x',
   pageComponent: "users/UserGroupView",
   path: '/UserGroupView',
   config: {
     appUrl: '/digitaltwin',
     allowUserGroupEdit: true,
     allowUserGroupInvite: true,
     allowManageInvites: true,
     allowManageUsers: true,
     allowViewPermissions: true,
     allowManagePermissions: true
     scripts: {
      itemFetchScript: 'fetchNonSystemCollections'
     }
   }
}
```

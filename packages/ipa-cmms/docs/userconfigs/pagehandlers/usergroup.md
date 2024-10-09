---
title: User Groups View
sidebar_position: 1500
---

|**Name**|**Description**|
|---|---|
|[`pageComponent`](#pageComponent)|Use `pageComponent: 'users/UserGroupView'` in a handler to activate the User Management View.|
|`appUrl`|(required) The url path from the basepath for any invite links.|
|`allowUserGroupEdit`|Whether the user should be able to edit a User Group’s name.|
|`allowUserGroupInvite`|Whether the user should be able to invites new and existing user’s the User Groups of which the user is a member.|
|`allowManageInvites`|Whether the user should be able to perform actions on existing invites like deleting and resending.|
|`allowManageUser`|Whether the user should be able to remove user’s from UserGroups.|

---

## `pageComponent`

Use `pageComponent: 'users/UserGroupView'` in a handler to activate the User Management View.

This view is designed to allow managing the users in UserGroups and invites to the UserGroups.

---

## `config`

### `appUrl`

(required)

```jsx
appUrl: '/',
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


## Example

```jsx
userGroup: {
   title: 'User Group',
   actionTitle: 'User Group Actions',
   icon: 'ion-gear-a icofont-2x',
   pageComponent: "users/UserGroupView",
   path: '/UserGroupView',
   config: {
     appUrl: '/',
     allowUserGroupEdit: true,
     allowUserGroupInvite: true,
     allowManageInvites: true,
     allowManageUsers: true
   }
}
```

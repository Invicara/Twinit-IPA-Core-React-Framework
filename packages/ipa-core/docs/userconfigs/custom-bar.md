---
title: Custom side Navigation and Header Bars
sidebar_position: 920
---

## Custom side Navigation and Header bars

The framework ships a header bar and a side navigation bar, and an application
can take them as they are, extend them, or replace them with its own.

Both are chosen the same way and independently of each other, so an application
can take the supplied header and keep its own navigation, or the other way
round.

## Choosing a component

The framework loads whichever component the User Config names, resolving the
value as a path under `app/ipaCore`, with `.jsx` appended. The file may sit in
any subfolder of `app/ipaCore`, including one you create.

```jsx
{
  "settings": {
    ...,
    "headerComponent": "components/AppHeader",
    "sidebarComponent": "components/AppSidebar",
    ...,
  }
}
```

That example loads `app/ipaCore/components/AppHeader.jsx` and
`app/ipaCore/components/AppSidebar.jsx`. Each file must export the component as
its **default export**.

:::note
If a User Config names a path where no component exists, the application falls
back to the framework's original side navigation and header, and prints the
reason to the console.
:::

Because the setting names a file in your application rather than a component in
the framework, the file is the seam: what you put in it decides whether you get
the supplied component, an extended one, or your own. The three sections below
are the three things you can put there.

## Using the supplied components

Re-export the component the framework provides and you are done.

```jsx
// app/ipaCore/components/AppHeader.jsx
import { AppHeader } from '@invicara/ipa-core/modules/IpaLayouts';

export default AppHeader;
```

```jsx
// app/ipaCore/components/AppSidebar.jsx
import { AppSidebar } from '@invicara/ipa-core/modules/IpaLayouts';

export default AppSidebar;
```

`AppHeader` renders the logo, the application name, the current project and the
account menu. `AppSidebar` renders a collapsed rail that opens on the burger or
on hovering a section, with sub-items expanding in place.

Neither needs configuring beyond the User Config setting. `AppHeader` picks up
the logo from [`settings.appImage`](../custom.md) when one is configured, and
falls back to the platform logo when none is.

## Extending the header

`AppHeader` takes a `slots` property for the pieces an application adds. A
notification tray, for instance, goes in `slots.actions`, and extra account-menu
entries go in `slots.menuItems`.

```jsx
// app/ipaCore/components/AppHeader.jsx
import { AppHeader } from '@invicara/ipa-core/modules/IpaLayouts';
import NotificationTray from './NotificationTray';

export default props => (
  <AppHeader
    {...props}
    slots={{
      actions: <NotificationTray />,
      menuItems: [
        {
          key: 'workspace',
          caption: 'Workspace',
          label: props.userConfig?.settings?.workspaceName,
          onSelect: () => openWorkspacePicker(),
        },
      ],
    }}
  />
);
```

### `slots`

| Slot        | Type  | Description                                                                                                                         |
| ----------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `actions`   | node  | Rendered in the toolbar, before the account cluster. Use it for controls that belong to the application rather than to the account. |
| `menuItems` | array | Extra account-menu rows. See the fields below.                                                                                      |
| `logo`      | node  | Replaces the logo, for branding that does not come from `settings.appImage`.                                                        |

Each entry in `menuItems` takes:

| Field      | Type     | Description                                                                               |
| ---------- | -------- | ----------------------------------------------------------------------------------------- |
| `key`      | string   | Required. Identifies the row to React.                                                    |
| `label`    | string   | The row's text.                                                                           |
| `caption`  | string   | Optional smaller line above the label, for a row that names both an action and its value. |
| `icon`     | node     | Optional. Replaces the row's trailing chevron.                                            |
| `onSelect` | function | Called when the row is chosen.                                                            |
| `danger`   | boolean  | Draws the row as a warning, with a leading icon, the way Log out is drawn.                |

Your rows are placed after the framework's own and before Log out, which stays
last, and they are drawn with the same row styles, so a menu does not end up
looking assembled from two different designs.

:::note
The extensions hang off a single `slots` property rather than being separate
properties because the framework spreads its application context into this
component flat, and that context already carries names such as `actions`. A
property named `actions` on the component itself would receive the framework's
value rather than yours.
:::

## Writing your own

Put your own component in the file instead, and it will be rendered in place of
the supplied one. The framework passes it the application context spread flat,
plus, for the header, five further properties.

### What the header receives

| Property          | Description                                                           |
| ----------------- | --------------------------------------------------------------------- |
| `titleInfo`       | `{ pageName, projectName, userName, switchProject, logout }`          |
| `switchProj`      | Click handler that opens the project picker.                          |
| `goToUserAccount` | Click handler that opens the platform account page.                   |
| `userLogout`      | Logs the user out.                                                    |
| `logoComponent`   | The framework's `Logo` component, which resolves `settings.appImage`. |

### What the side navigation receives

The side navigation receives the application context and nothing further. Pages
arrive under `router`, which is the same source the default navigation reads:

| Property            | Description                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| `router.pageGroups` | `[{ groupName, icon, items: [page] }]` when the User Config groups pages. |
| `router.pageList`   | `[page]` when it does not.                                                |
| `page`              | `{ path, key, title, icon, dontindex }`                                   |

:::note
The application context is spread into these components as individual
properties, and it is a wide and growing set that includes `actions`, `user`,
`userConfig`, `selectedItems` and `router`. When you write your own component,
read the properties you need rather than accepting a property of your own with a
name the context might also use.
:::

## Hiding them instead

To render neither, see [`noSideBar` and `noTitleBar`](./top-level.md#settings).
Your pages then have to provide their own navigation, and their own way to
switch project and sign out.

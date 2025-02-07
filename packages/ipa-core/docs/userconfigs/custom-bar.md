---
title: Custom side Navigation and Header Bars
sidebar_position: 920
---
## Custom side Navigation and Header bars

A user now has the ability to import their own custom side Navigation bar or Header bar that replaces the default ones in a DT project. 

In order to achieve this, the custom components must be placed inside `app/ipaCore` in the DT project. You also have the freedom to place the custom component inside any subfolder of `app/ipaCore` or create your own subfolder.

Once the component has been placed inside the DT app, we then must update the projects UserConfig to ensure the app loads the custom component. You need to provide the path to your component. In the example below, we placed the custom components inside the DT app under the following path, `app/ipaCore/components/customComponents`.

```jsx
{
  "settings": {
    ...,
    "headerComponent": "components/customComponents/HeaderBar",
    "sidebarComponent": "components/customComponents/SidebarNav",
    ...,
  }
} 
```

:::note
If a user enters an invalid path where component doesn’t exist, it will revert to default ipa-core sidenav/header
:::

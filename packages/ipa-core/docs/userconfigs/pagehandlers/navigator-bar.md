---
title: Hiding the Navigation or Header Bar
sidebar_position: 910
---

## Hiding the Navigation or Header Bar
The side Navigation and or the Header Bar's can be hidden from a project via the UserConfig file. You must update the `Settings` object as shown below.

```json
 "settings": {
    "noSideBar": true,
    "noTitleBar": true
  }
  ```

|Name|Description|
|---|---|
|`noSideBar` (Boolean)| Setting this to true will remove the side Navigation bar from the project|
|`noTitleBar` (Boolean)| Setting this to true will remove the Header bar from the project|

:::note
Those two components will default to display in a project if neither are provided in the Settings object inside the UserConfig file.
:::
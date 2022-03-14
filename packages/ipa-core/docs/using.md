---
title: Use the Twinit.io UI Framework
sidebar_position: 200
---

## index.js

To use the Twinit.io UI framework, render the `IpaMainLayout` component in the client application's `index.js` and pass a framework configuration to it.

```jsx
import { IpaMainLayout } from '@invicara/ipa-core'
import { ipaConfig } from './ipaCore/ipaConfig'

render(<IpaMainLayout ipaConfig={ipaConfig} />, document.getElementById('app'));
```

The `IpaMainLayout` component also supports an optional `onConfigLoad` property. The `onConfigLoad` property allows you to execute a callback function after the user has selected a project and a user config, and the user config has completed loading. This approach allows you to run any application-specific logic you want to execute for a user.

This callback function will be passed to the framework's Redux store, the selected user config, and the framework's application context.

```jsx
import { IpaMainLayout } from '@invicara/ipa-core'
import { ipaConfig } from './ipaCore/ipaConfig'

const onConfigLoad = (store, userConfig, appContext) => {
  console.log("Framework has completed loading user config")
  console.log("store: ", store)
  console.log("userConfig: ", userConfig)
  console.log("appContext: ", appContext)
}

render(<IpaMainLayout ipaConfig={ipaConfig} onConfigLoad={onConfigLoad}/>, document.getElementById('app'));
```

The `IpaMainLayout` can also take an optional component to display in the bottom panel of the framework UI.

```jsx
import { IpaMainLayout } from '@invicara/ipa-core'
import { ipaConfig } from './ipaCore/ipaConfig'
import MyBottomPanelComponent from './myComponents/MyBottomPanelComponent'

const onConfigLoad = (store, userConfig, appContext) => {
  console.log("Framework has completed loading user config")
  console.log("store: ", store)
  console.log("userConfig: ", userConfig)
  console.log("appContext: ", appContext)
}

render(<IpaMainLayout ipaConfig={ipaConfig} onConfigLoad={onConfigLoad} bottomPanelContent={MyBottomPanelComponent} />, document.getElementById('app'));
```

## Add New Pages 

To add a new page to your application:

1.  Create a new React component representing your page. The page must
    be the default export. Place this file in
    `app/ipaCore/pageComponents`.
2.  Add the appropriate configuration to the user config to load and
    display the page.

Any page found to be configured in a user config will first be attempted to be loaded from the local application. The framework will look in the `app/ipaCore/pageComponents` folder first. If the page cannot be loaded from `app/ipaCore/pageComponents`, the framework will attempt to load the page from the set of pages provided by the framework. If the page still is not found an error will be printed to the console and the page will be skipped.

The framework will print the console whether the page was loaded from the application, the framework, or not found and skipped.

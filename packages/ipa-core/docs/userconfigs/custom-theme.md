---
title: Custom Theme
sidebar_position: 900
---
## Custom Theme

An IPA app offers multiple ways to theme it’s styling to the specific needs of the customer. This theming can be done at multiple levels (the source code level, the client app level, the project level). The default Framework theme is set inside the DigitalTwin-Factory source code in `/src/IpaStyles/styleVars.json`.

:::note
The default Framework theme should not be changed for custom theming
:::

###  App Theme
To define an App level theme that overrides the Framework Theme and will be the same across all projects, you can use the /app/ipaCore/ipaConfig.js file of your IPA app. They will get loaded to the :root CSS selector just like the Framework Theme does.

This file is already used for a number of configurations and it can now be used to also change the CSS variables that will be loaded on :root by defining the styleVars property like so:

```jsx
const ipaConfig = {
  ...,
  styleVars: {
    "--app-accent-color": "coral",

    "--head-bkg-color": "slategrey",
    "--head-appname-color": "white",
    "--head-menu-bkg-color": "lightslategrey",
    "--head-menu-hover-color": "#999999",
    
    "--new-var": "blue"
  },
  ...
}

export default ipaConfig
```
This will override all the Framework Theme variables defined in the styleVars.json file from ipa-core. When a styleVars object is defined in `ipaConfig.js`, all CSS variables needed should be described in this file. Variables that are only described in the Framework Theme, will not be loaded.

:::note
This is suitable for projects that need different Themes for different users, or for environments that host project from multiple customers that need their own branding.
:::

 
###  UserConfig Theme

To customize a single project’s theme, or even, customize the Theme of a single role for a single project, you can change the appropriate UserConfig by adding a styles property to settings property that contains Theme variables like so:

```json
{  
  ...,
  "settings": {
    ...,
    "styles": {
      "--app-accent-color": "#9b8dc6",
      "--head-bkg-color": "#343334",
      "--head-appname-color": "#9b8dc6",
      "--head-menu-bkg-color": "#5d5c5d",
      "--head-menu-hover-color": "#9b8dc6",
      "--nav-bkg-color": "#343334",
      "--nav-icon-color": "#ffffff",
      "--nav-hover-color": "#ebe8f4",
      "--nav-activegrp-bkg-color": "#f8f5fa",
      "--fancytree-one-color": "#9b8dc6",
      "--fancytree-one-channel-color": "#ebe8f4",
      "--fancytree-two-color": "#7aaabe",
      "--fancytree-two-channel-color": "#e4eef2",
      "--fancytree-three-color": "#b5d1c0",
      "--fancytree-three-channel-color": "#f0f6f2"
    }
  }
}
```

Just like when describing the App Theme, you need to redefine all the Theme variables you need in the User Theme. If a variable is only described in the Framework Theme or the App Theme, it will not be loaded.

They will get loaded to the :root CSS selector just like the Framework Theme and the App Theme do.

:::note
This is suitable for projects that need different Themes for different users, or for environments that host project from multiple customers that need their own branding.
:::


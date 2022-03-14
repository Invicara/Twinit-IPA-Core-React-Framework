---
title: Custom Logo, App Name, and Colors
sidebar_position: 400
---
## Application Logo

You can provide your own logo to appear in the top left corner of the application by providing either a url to an image or the file name of a file which has been uploaded to the project.

```jsx
settings: {
    appImage: { 
        url: "url to an image online",
        filename: "name fo a file uploaded to project"
    }
}
```

Logo images should be 25px by 125px for best display.

## Application Name

The Application Name can be provided by configuring it in the `IpaConfig.js`.

```jsx
const ipaConfig = {
  appName: "My Twinit.io Application"
}
```

## Application Colors

Your own css files can be provided in ipaCore/css to modify the default theme.

```jsx
const ipaConfig = {
  appName: "My Twinit.io Application",
  css: ['myCustomTheme.css']
}
```

### myCustomTheme.css

By changing these css variables on the root, in your own stylesheet you
can easily change the default theme's colors.

```css
:root {
    //accent color for the entire application
    --app-accent-color: #C71784;

    //styles for the app header and dropdown menu
    --head-bkg-color: #333333;  //background color of the top header bar
    --head-appname-color: whitesmoke;  //text color of the application name next to the logo
    --head-menu-bkg-color: #666666;  //background color of the right hand session dropdown
    --head-menu-hover-color: #999999;  //background color on hover of a menu item

    //styles for the left navbar
    --nav-bkg-color: #333333;  //background color of the left hand nav, both grouped and ungrouped
    --nav-icon-color: white;  //color of icons in nav when not active
    --nav-hover-color: #999999;  //background color on hover of nev item
    --nav-activegrp-bkg-color: #bfbfbf;  //background color of a selected nav item, both grouped and ungrouped
    //active nav items icons take --app-accent-color and/or have active class applied

    //styles for the FancyTree control  by level
    --fancytree-one-color: #C71784;
    --fancytree-one-channel-color: #f3d5e4;
    --fancytree-two-color:#f26827;
    --fancytree-two-channel-color: #fde0d7;
    --fancytree-three-color:#00a693;
    --fancytree-three-channel-color: #cdebe8;
}
```

:::note
If your application adds its own icons to be used in the left navbar, you will need two versions of the icon. One in the same color as --nav-icon-color and one in the --app-accent-color. The one in the --app-accent-color should be displayed when the icon has the the 'active' class.
:::

# IafViewer

The IafViewer component enables a user to interact with a digital twin model in 3D space using various tools.

## Install

```js
npm install @invicara/iaf-viewer
```

## Import 

```js
import { IafViewer } from "@invicara/iaf-viewer";
```

## Props

### Data props

|Prop          |Type   |Description                                                                      |Default value |
|--------------|-------|---------------------------------------------------------------------------------|--------------|
|toolbarSize   |String |Sets the size of the toolbar. Pass `"small"`, `"medium"`, or `"large"`.          |`"medium"`    |
|showToolTip   |Boolean|Enables or disables the tool tip hover-over descriptions. Pass `true` or `false`.|`true`        |
|sidePanelColor|String|Sets the side panel color. You can pass a hex code, RGB value, or a color name.   |`"#1D1D1D"`   |
|onHoverIconColor|String|Sets the icon color during a mouse hover event. You can pass a hex code, RGB value, or a color name.|`"invert(40%) sepia(86%) saturate(6224%) hue-rotate(311deg) brightness(83%) contrast(101%)"`|
|onActiveIconColor|String|Sets the color of the active icon. You can pass a hex code, RGB value, or a color name.|`"invert(40%) sepia(86%) saturate(6224%) hue-rotate(311deg) brightness(83%) contrast(101%)"`|
|toolbarColor|String|Sets the toolbar color. You can pass a hex code, RGB value, or a color name.        |`"#333333"`   |
|isShowNavCube |Boolean|Shows or hides the navigation cube. Pass `true` or `false`.                      |`true`        |

### Callback props

|Prop                           |User interaction that calls callback function                                    |Returns|
|-------------------------------|---------------------------------------------------------------------------------|-------|
|OnIsolateElementChangeCallback |The user isolates an element in the graphics viewer when they right-click the element, then click **Isolate**| The isolated element's id|
|OnSelectedElementChangeCallback|The user selects one or more elements in the graphics viewer| An updated array of the selected elements' ids|
|OnResetCallback                |The user clicks the **Reset** button|`true`|
|OnHiddenElementChangeCallback  |The user hides one or more elements in the graphics viewer| An updated array of the hidden elements' ids|
|saveSettings                   |The user clicks the **Save & Close** button in the **Settings** pane. | The IafViewer settings as a JSON object for your function to store in local storage. | 

## Example

```js
import React, {useEffect} from "react";
import { IafViewer } from "@invicara/iaf-viewer";

const ViewerPage = () => {

  const mySaveSettingsFunction = (settings) => {
    //your function here
  }

  return (
    <PageTemplate>
      <IafViewer 
        toolbarSize="large" 
        saveSettings={mySaveSettingsFunction}
      />
    </PageTemplate>
  )
}

export default ViewerPage;

```

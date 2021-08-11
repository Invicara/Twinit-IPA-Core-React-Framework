---
title: EnhancedPickListSelect
sidebar_position: 16
---
A generic modal dialog with a title bar and a close button. All other content is supplied via a “modal body” component. GenericModal is often wrapped by a HOC to create a specific template.  
  
Dialogs are displayed using: `props.actions.showModal(<SomeDialogComponent />)`

Dialogs can be hidden programmatically by using: `props.actions.showModal(false)`

### Properties

- `title`: The title shown at the top of the dialog|
- `modalBody`: the content to display within the dialog box|
- `barClasses`: Classes to customize the title bar|
- closeButtonHandler: A handler that’s called when the dialog X is clicked. If you provide this handler then you must also close the dialog using `props.actions.showModal(false)`|
- ~~`modalType`~~: does nothing|
- ~~`placeHolder`~~: does nothing|
- ~~`width`~~: the width for the dialog - not currently working|
- ~~`height`~~: the height for the dialog - not currently working|
- `customClasses`: Classes to customize the dialog|
- `noPadding`: if present no padding; otherwise padding is `3% 10%`|
- `noBackground`: if present dialog background is `transparent` otherwise background is `white`|
- `customTemplate`: if present then no template (no title bar, no x, no content) is displayed and the children of the GenericTemplate tag are considered to be the template for the dialog box.|


### Example

```jsx
import React, {useEffect} from "react"
import {IpaDialogs, IpaControls} from "@invicara/ipa-core"
const {GenericModal} = IpaDialogs
const {IpaButton} = IpaControls

const TestPage = (props) => {
  useEffect(() => props.onLoadComplete(), [])

  const clickHandler = () => {
    props.actions.showModal(<MyModal />)
  }

  return (
    <div>
      <h1>This is a test page</h1>
      <h2>You can put test stuff here</h2>
      <IpaButton onClick={clickHandler}>Click Me For A Sample Dialog</IpaButton>
    </div>
  )
}

const MyModal = (props) => {
  return (
    <GenericModal
      title="Test Modal"
      modalBody={
        <div>
          This is the modal body
        </div>
      }
    />
  )
}

export default TestPage;
```

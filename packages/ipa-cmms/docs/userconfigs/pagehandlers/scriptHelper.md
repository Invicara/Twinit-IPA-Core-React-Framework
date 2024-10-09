---
title: ScriptHelper
sidebar_position: 1600
---

`ScriptHelper` is a helper function that allows a user to load and execute scripts from the client. 

To import the `ScriptHelper` to your component, use the following import:

```jsx
import {ScriptHelper} from "@invicara/ipa-cmms/modules/IpaUtils";
```
---

## `Supported functions`

Please find a list of all the functions provided by the `ScriptHelper` below.

### `loadScript`

This will load all the scripts available to your project that where defined in the UserConfig file.

### `executeScript`

This will allow a user to call a script that is available to the project. `ScriptHelper.executeScript()` accepts two arguments, the name of the script you wish to call and also an input object that you wish to pass through to the script.

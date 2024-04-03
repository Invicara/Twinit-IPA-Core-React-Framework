---
title: ScriptCache
sidebar_position: 1700
---

`ScriptCache` is a helper function that allows a user to run and store the results of a script in a cache to avoid unnecessary repeat script calls from the client. 

To import the `ScriptCache` to your component, use the following import:

import {ScriptCache} from "@invicara/ipa-core/modules/IpaUtils";
```jsx
```

---

## `Supported functions`

Please find a list of all the functions provided by the `ScriptCache` below

### `runScript`
`ScriptCache.runScript()` allows a user to excute a script. Upon each call, the function will check if the script has been previously called and will return its results if it has been. Otherwise, it will exceute the script, store the result in the cache and then return the result.


### `clearCache`

`ScriptCache.clearCache()` allows a user to clear the Cache.
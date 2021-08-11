---
title: Script Runner View
sidebar_position: 11
---

## `pageComponent`

Use `pageComponent: 'solutionMgmt/ScriptRunnerView'` in a handler to activate the ScriptRunner view.

This view is designed to allow the user to run pre-defined scripts, and optionally, to pass JSON inputs to the scripts.

### Configuration

- `config.allowScriptInput` **optional**: sets whether to display the text field to add JSON script inputs.

```jsx
config: {
  allowScriptInput: true
}
```

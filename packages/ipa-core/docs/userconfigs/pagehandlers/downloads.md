---
title: Downloads View
sidebar_position: 1100
---

`DownloadsView` allows the user to download additional software.

---

## `pageComponent`

Use `pageComponent: 'DownloadsView'` in a handler to activate the Downloads View.

---

## `systems`

Valid systems are Autodesk Revit, Autodesk Navisworks, and Autodesk Civil 3D.

---

## Example

```json
{
  "title": "Downloads",
  "icon": "inv-icon-svg inv-icon-download",
  "shortName": "down",
  "description": "Downloads",
  "pageComponent": "DownloadsView",
  "systems": [
    "Autodesk Revit", 
    "Autodesk Navisworks", 
    "Autodesk Civil 3D"

  ],
  "path": "/downloads"
}
```
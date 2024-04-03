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

The following list are valid systems supported by the platform:

- Autodesk Revit – 2018, 2019, 2020, 2021, 2022, 2023, & 2024
- Autodesk Navisworks – 2020 & 2021
- Autodesk Civil 3D - 2020, 2021 & 2022
- AutoCAD – 2020, 2021, 2022, 2023, & 2024 and earlier versions of AutoCAD.
- IFC Extractor

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
---
title: Select
sidebar_position: 2200
---
A generic and easy to use select control that encompasses common behaviour and style across all apps.
It uses the `react-select` library and it supports multi selects and creatable selects.

### Properties

- `labelProps`: `object` of `props` related to the label, they will be passed to the underlying `ControlLabel` component. If not provided, the `ControlLabel` will not be displayed.
- `creatable`: If set to true, new options can be created on the fly by the user. Note : We use `CreatableSelect` instead of `Select` as the underlying select component. The same props or passed to both components.
- `isMulti`: [See react-select](https://react-select.com/props)
- `value`: [See react-select](https://react-select.com/props)
- `onChange`: [See react-select](https://react-select.com/props)
- `options`: [See react-select](https://react-select.com/props)
- `closeMenuOnSelect`: [See react-select](https://react-select.com/props)
- `isClearable`: [See react-select](https://react-select.com/props)
- `placeholder`: If defined, it is sent as the placeholder props to the underlying component. If the label props is defined, it will be used as a default placeholder `Select a ${props.label}`. If no placeholder or label is defined, then nothing is sent as the placeholder to the underlying component. 
- `label`: If the label props is defined but no placeholder is defined, it will be used as a default placeholder `Select a ${props.label}`. If no placeholder or label is defined, then nothing is sent as the placeholder to the underlying component. 
- `isDisabled`: [See react-select](https://react-select.com/props)
- `menuPlacement`: [See react-select](https://react-select.com/props)
- `menuPosition`: [See react-select](https://react-select.com/props)
- `styles`: react-select styles object to override the default styles. [See react-select](https://react-select.com/props)


### PropTypes
```jsx
Select.propTypes = {
  labelProps: shape({...ControlLabel.propTypes}),
  creatable: bool,
  isMulti: bool,
  value: any,
  onChange: func,
  options: array,
  closeMenuOnSelect: func,
  isClearable: bool,
  placeholder: string,
  label: string,
  isDisabled: bool,
  menuPlacement: string,
  menuPosition: string,
  styles: object
}
```
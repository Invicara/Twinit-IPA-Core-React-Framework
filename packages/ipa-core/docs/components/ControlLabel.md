---
title: ControlLabel
sidebar_position: 1001
---
A generic and easy to use label that encompasses common behaviour and style across all invicara apps. It should be used in every control that uses a label, or as a base to create control label variants.

### Properties

- `className`: a `className` `string` to append to the default classNames, it is one of the two ways you can style the `label`.
- `style`: a `style` `object` passed directly to the underlying `label`, it is the other way you can style the `label`.
- `text`: The label text as a `string`.


### PropTypes
```jsx
{
    style: object,
    text: string,
    className: string,
}
```

### Examples
You can find examples of usage in the components below :
- **`BaseTextInput`**: `ControlLabel` is used for a text input. The label props are directly requested by the parent component as a `labelProps` prop.
- **`Select`**: `ControlLabel` is used for a select control. The label props are directly requested by the parent component as a `labelProps` prop.

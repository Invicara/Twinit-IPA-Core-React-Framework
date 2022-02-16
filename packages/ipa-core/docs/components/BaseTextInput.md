---
title: BaseTextInput
sidebar_position: 1000
---
A text input that provides basic functionality and styling but can be extended or composed to create a wide range of text input variants.

### Properties

- `className`: a className appended to the default classNames.
- `inputProps`: *(required)* Object of props related to the input, they are used to pass properties to the underlying `input` tag or to the input component provided in props (see component property below).
  - `type`: It is be passed directly to the underlying `input` or alternative `component`.
  - `value`: It is be passed directly to the underlying `input` or alternative `component`.
  - `onChange`: It is be passed directly to the underlying `input` or alternative `component`.
  - `placeholder`: It is be passed directly to the underlying `input` or alternative `component`.
  - `disabled`: It is be passed directly to the underlying `input` or alternative `component`.
  - `className`: a `className` `string` to append to the default classNames, it is one of the two ways you can style the `input`.
  - `style`: a `style` `object` passed directly to the underlying `input` or alternative `component`, it is the other way you can style the `input`.
  - `onFocusChange`: a `function` callback called with argument `true` when the underlying `input` or component gets the focus, and `false`, when it loses the focus. 
- `labelProps`: `object` of `props` related to the label, they will be passed to the underlying `ControlLabel` component. If not provided, the `ControlLabel` will not be displayed.
- `component`: An alternative component to the react `input` tag.
- `children`: A React `Node` or an `array` of `Node`  that is displayed after the `input` in the DOM.


### PropTypes
#### BaseTextInput
```jsx
{
    className: string,
    labelProps: ControlLabel.propTypes,
    inputProps: shape({
        type: string,
        value: any,
        onChange: func,
        placeholder: string,
        disabled: bool,
        className: string,
        style: object,
        onFocusChange: func,
    }).isRequired,
    component: element,
}
```

#### ControlLabel
```jsx
{
    style: object,
    text: string,
    className: string,
}
```

### Examples
You can find examples of usage in the components below :
- **`EntityModalTextInput`**: A classic example of composition, the `BaseTextInput` is used without the `component` prop but wrapped in another component to add a text overlay that responds to the input's focus.
- **`CollapsibleTextInput`**: This component uses `BaseTextInput` but changes it's core `input` component to another component with specific features when a `button` passed as `children` is clicked.

import React, { useState } from "react";
import PropTypes from "prop-types";
import { any, bool, element, func, object, shape, string } from "prop-types";
import "./BaseTextInput.scss";
import ControlLabel from "./ControlLabel";

const BaseTextInput = (props) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    props.inputProps.onFocusChange?.(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    props.inputProps.onFocusChange?.(false);
  };

  const baseClassName = "base-text-input";
  let classNameModifiers = isFocused ? `${baseClassName}--is-focused` : "";

  let inputProps = {
    value: props.inputProps.value,
    type: props.inputProps.type,
    onChange: props.inputProps.onChange,
    placeholder: props.inputProps.placeholder,
    disabled: props.inputProps.disabled,
    onFocus: handleFocus,
    onBlur: handleBlur,
    className: `form-control ${props.inputProps.className}`,
    style: props.style,
  };

  return (
    <div
      className={`${baseClassName} ${props.className} ${classNameModifiers}`}
    >
      {props.labelProps && <ControlLabel {...props.labelProps} />}
      {props.component ? (
        <props.component {...inputProps} />
      ) : (
        <input {...inputProps} />
      )}
      {props.children}
    </div>
  );
};

BaseTextInput.propTypes = {
  className: string,
  labelProps: shape({ ...ControlLabel.propTypes }),
  inputProps: shape({
    type: string,
    value: any,
    onChange: func,
    placeholder: string,
    disabled: bool,
    className: string,
    style: object,
    onFocusChange: func,
    onBlur: func,
  }).isRequired,
  component: element,
};

export default BaseTextInput;

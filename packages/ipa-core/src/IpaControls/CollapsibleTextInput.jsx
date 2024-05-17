import { string } from "prop-types";
import React, { useState } from "react";
import BaseTextInput from "./BaseTextInput";
import GenericMatButton from "./GenericMatButton";
import "./CollapsibleTextInput.scss";
import { TextareaAutosize } from "@material-ui/core";

const CollapsibleTextInput = (props) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <BaseTextInput
      className={`collapsible-text-input`}
      inputProps={{
        ...props.inputProps,
        value:
          (isCollapsed && props.inputProps?.collapsedText) ||
          props.inputProps?.value,
        onFocusChange: (isFocused) => {
          props.inputProps.onFocusChange?.(isFocused);
          setIsFocused(isFocused);
        },
      }}
      labelProps={{
        ...props.labelProps,
        text: props.labelProps?.text,
        className: `collapsible-text-input__label ${props.labelProps?.className}`,
      }}
      component={
        !isCollapsed
          ? (props) => (
              <TextareaAutosize {...props} style={{ paddingBottom: "2em" }} />
            )
          : undefined
      }
    >
      <GenericMatButton
        size="small"
        customClasses="attention"
        className="collapsible-text-input__show-hide"
        onClick={toggleCollapse}
      >
        {isCollapsed ? (
          <div style={{ color: "black" }}>Show all</div>
        ) : (
          <div style={{ color: "black" }}>Hide all</div>
        )}
      </GenericMatButton>
    </BaseTextInput>
  );
};

CollapsibleTextInput.propTypes = {
  ...BaseTextInput.propTypes,
  labelProps: {
    ...BaseTextInput.propTypes.labelProps,
    collapsedText: string,
  },
};

export default CollapsibleTextInput;

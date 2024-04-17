import { bool, object, string } from "prop-types";
import React from "react";
import "./ControlLabel.scss";

const ControlLabel = (props) => (
  <label
    style={props.style}
    className={`control-label ${props.className} ${props.required ? "required" : ""}`}
  >
    {props.text}
  </label>
);

ControlLabel.propTypes = {
  style: object,
  text: string,
  className: string,
  required: bool,
};

export default ControlLabel;

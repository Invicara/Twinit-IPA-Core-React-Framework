import GenericMatButton from "./GenericMatButton";
import React from "react";
import PropTypes from "prop-types";
import "./FetchButton.scss";

export const FetchButton = ({ customClasses, ...props }) => (
  <GenericMatButton
    {...props}
    customClasses={"fetch-button " + (customClasses || "")}
  />
);

FetchButton.propTypes = {
  className: PropTypes.string,
  size: PropTypes.string,
  styles: PropTypes.object,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  customClasses: PropTypes.object,
  children: PropTypes.string,
};

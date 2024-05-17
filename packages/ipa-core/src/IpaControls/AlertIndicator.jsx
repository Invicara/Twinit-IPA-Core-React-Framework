import React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "@material-ui/core";
import "./AlertIndicator.scss";

const AlertIndicator = ({ className, descriptions }) => {
  return (
    <Tooltip
      title={
        <div>
          {descriptions.map((a) => (
            <p>{a}</p>
          ))}
        </div>
      }
    >
      <i
        className={`alert-indicator ${className || ""} fa fa-exclamation-triangle`}
      />
    </Tooltip>
  );
};

export default AlertIndicator;

AlertIndicator.PropTypes = {
  className: PropTypes.string,
  descriptions: PropTypes.array,
};

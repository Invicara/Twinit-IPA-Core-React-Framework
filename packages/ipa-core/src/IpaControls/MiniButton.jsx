import React from "react";
import PropTypes from "prop-types";

import "./MiniButton.scss";

const MiniButton = ({ className, onClick, value }) => (
  <div
    className={(className || "") + " mini-button"}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    {value}
  </div>
);

export default MiniButton;

export const MiniIconButton = ({ className, icon, onClick }) => (
  <div
    className={(className || "") + " mini-icon-button"}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    <i className={icon} />
  </div>
);

MiniButton.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
  value: PropTypes.string,
};

MiniIconButton.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  onClick: PropTypes.func,
};

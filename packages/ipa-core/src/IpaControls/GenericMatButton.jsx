import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";

import "./GenericMatButton.scss";

export default class GenericMatButton extends React.Component {
  render() {
    return (
      <div className={`GenericMatButton ${this.props.className}`}>
        <Button
          variant="contained"
          size={this.props.size}
          style={{ ...this.props.styles }}
          onClick={this.props.onClick}
          disabled={this.props.disabled}
          className={this.props.customClasses}
        >
          {this.props.children}
        </Button>
      </div>
    );
  }
}

GenericMatButton.propTypes = {
  className: PropTypes.string,
  size: PropTypes.string,
  styles: PropTypes.object,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  customClasses: PropTypes.object,
  children: PropTypes.string,
};

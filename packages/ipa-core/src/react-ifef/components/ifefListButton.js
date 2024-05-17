import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefListButton extends React.Component {

  render() {
    var classes = classnames(
      {'enable-pointer-events': true},
      'item-' + this.props.action,
      'item-' + this.props.side + '-edit',
      this.props.customClasses
    );
    return (
      <div className={classes} >
        {this.props.children}
      </div>
    );
  }
}

IfefListButton.propTypes = {
  customClasses: PropTypes.string,
  action: PropTypes.string,
  side: PropTypes.string
};

IfefListButton.defaultProps = {
  customClasses: '',
  action: 'delete',
  side: 'left'
};

export default IfefListButton;
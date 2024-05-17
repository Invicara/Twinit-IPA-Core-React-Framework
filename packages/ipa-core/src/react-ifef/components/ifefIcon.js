import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefIcon extends React.Component {


  render() {
    let prefix = !this.props.ignorePrefix?this.props.icon.indexOf('ion-') === 0 ? '' : 'ion-':'';
    let classes = classnames(
      {'icon': true},
      prefix + this.props.icon,
      this.props.customClasses
    );
    return (
      <i className={classes}></i>
    );
  }
}

IfefIcon.propTypes = {
  customClasses: PropTypes.string,
  icon: PropTypes.string.isRequired,
  ignorePrefix: PropTypes.bool
};

IfefIcon.defaultProps = {
  customClasses: '',
  ignorePrefix: false
};

export default IfefIcon;
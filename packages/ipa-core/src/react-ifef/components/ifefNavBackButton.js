import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import IfefButton from './ifefButton';

class IfefNavBackButton extends React.Component {

  render() {
    var platform = this.context.ifefPlatform;

    var classes = classnames(
      {'nav-view-transition-android': platform.isAndroid,
       'nav-view-transition-ios': !platform.isAndroid
      },
      'nav-view-direction-' + this.context.ifefNavDirection,
      this.props.customClasses,
      "buttons back-button pull-left"
    );

    return (

          <IfefButton {...this.props} {...this.state} customClasses={classes} backButton={true}>
            { this.props.children }
          </IfefButton>

    );
  }
}

IfefNavBackButton.propTypes = {
  customClasses: PropTypes.string
};

IfefNavBackButton.defaultProps = {
  customClasses: ''
};

IfefNavBackButton.contextTypes = {
  ifefPlatform: PropTypes.object,
  ifefNavDirection: PropTypes.string,
  ifefSetTransitionDirection: PropTypes.func
};

export default IfefNavBackButton;

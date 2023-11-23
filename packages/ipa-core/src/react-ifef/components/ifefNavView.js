import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefNavView extends React.Component {

  // catch the new NavView mounting so we can close modals, alerts, etc.
  componentDidMount() {
    //console.log("NavView mounted.");
    this.context.ifefCloseForTransition();
  }

  render() {
    var platform = this.context.ifefPlatform;
    var classes = classnames(
      'nav-view',
      {'nav-view-transition-android': platform.isAndroid,
       'nav-view-transition-ios': !platform.isAndroid
      },
      'nav-view-direction-' + this.context.ifefNavDirection,
      this.props.customClasses
    );
    return (
      <div className={ classes } >

          { this.props.children }

      </div>

    );
  }
}

IfefNavView.propTypes = {
  customClasses: PropTypes.string
};

IfefNavView.defaultProps = {
  customClasses: ''
};

IfefNavView.contextTypes = {
  ifefPlatform: PropTypes.object,
  ifefNavDirection: PropTypes.string,
  ifefCloseForTransition: PropTypes.func
};

export default IfefNavView;

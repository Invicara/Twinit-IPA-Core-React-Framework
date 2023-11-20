import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefSidePanel extends React.Component {

  render() {
    var classes = classnames(
      'snap-drawer',
      'asf-panel',
      'asf-panel-' + this.props.side,
      'snap-drawer-' + this.props.side,
      this.props.customClasses
    );
    return (
      <div className={classes}>
        {this.props.children}
      </div>
    );
  }
}

IfefSidePanel.propTypes = {
    side: PropTypes.string,
    customClasses: PropTypes.string
};

IfefSidePanel.defaultProps = {
    side: 'left',
    customClasses: ''
};

export default IfefSidePanel;
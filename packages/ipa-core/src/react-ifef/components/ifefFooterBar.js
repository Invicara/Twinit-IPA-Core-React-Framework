import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefFooterBar extends React.Component {

  componentDidMount() {
    this.context.ifefUpdateHasX('ifefHasFooter', true);
  }

  render() {
    var classes = classnames(
      {'bar': true, 'bar-footer': true},
      this.props.customClasses || 'bar-stable', // default class
      {'has-tabs': this.context.ifefHasTabs}
    );
    return (
      <div className={ classes } >
        { this.props.children }
      </div>
    );
  }
}

IfefFooterBar.propTypes = {
  customClasses: PropTypes.string
};

IfefFooterBar.defaultProps = {
  customClasses: '',
  ifefHasTabs: false
};

IfefFooterBar.contextTypes = {
  ifefUpdateHasX: PropTypes.func.isRequired,
  ifefHasTabs: PropTypes.bool
};

export default IfefFooterBar;
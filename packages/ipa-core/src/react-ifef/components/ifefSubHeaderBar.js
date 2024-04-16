import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefSubHeaderBar extends React.Component {

  componentDidMount() {
    this.context.ifefUpdateHasX('ifefHasSubheader', true);
  }

  render() {
    var classes = classnames(
      {'bar': true, 'bar-subheader': true},
      this.props.customClasses || 'bar-stable', // default class
      {'has-tabs-top': this.context.ifefHasTabsTop}
    );
    return (
      <div className={ classes } >
        { this.props.children }
      </div>
    );
  }
}

IfefSubHeaderBar.propTypes = {
  customClasses: PropTypes.string
};

IfefSubHeaderBar.defaultProps = {
  customClasses: ''
};

IfefSubHeaderBar.contextTypes = {
  ifefUpdateHasX: PropTypes.func,
  ifefHasTabsTop: PropTypes.bool
};

export default IfefSubHeaderBar;
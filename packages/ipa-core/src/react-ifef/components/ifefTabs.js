import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefTabs extends React.Component {
  

  componentDidMount() {
    if (this.props.tabsTop) {
      this.context.ifefUpdateHasX('ifefHasTabsTop', true);
    } else {
      this.context.ifefUpdateHasX('ifefHasTabs', true);
    }
  }

  componentWillUnmount() {
    if (this.props.tabsTop) {
      this.context.ifefUpdateHasX('ifefHasTabsTop', false);
    } else {
      this.context.ifefUpdateHasX('ifefHasTabs', false);
    }
  }

  render() {
    var classes = classnames(
      {'tabs-top' : this.props.tabsTop},
      this.props.customClasses
    );
    return (
      <div className={ classes } >
        <div className="tabs">
          { this.props.children }
        </div>
      </div>
    );
  }
}

IfefTabs.propTypes = {
  customClasses: PropTypes.string,
  tabsTop: PropTypes.bool
};

IfefTabs.defaultProps = {
  customClasses: ''
};

IfefTabs.contextTypes = {
  ifefUpdateHasX: PropTypes.func
};

export default IfefTabs;
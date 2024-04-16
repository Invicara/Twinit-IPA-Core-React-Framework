import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefSubFooterBar extends React.Component {

  componentDidMount() {
    this.context.ifefUpdateHasX('ifefHasSubfooter', true);
  }

  render() {
    var classes = classnames(
      {'bar': true, 'bar-subfooter': true},
      this.props.customClasses || 'bar-stable' // default class
    );
    return (
      <div className={ classes } >
        { this.props.children }
      </div>
    );
  }
}

IfefSubFooterBar.propTypes = {
  customClasses: PropTypes.string
};

IfefSubFooterBar.defaultProps = {
  customClasses: ''
};

IfefSubFooterBar.contextTypes = {
  ifefUpdateHasX: PropTypes.func
};


export default IfefSubFooterBar;
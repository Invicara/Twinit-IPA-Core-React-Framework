import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';

class IfefTab extends React.Component {


  render() {
    var icon = this.props.icon ? <i className={'icon ion-' + this.props.icon}>{this.props.children}</i> : null;
    var classes = classnames(
      {'tab-item': true,
       'active' : this.props.active},
      this.props.customClasses
    );
    return (
        <Link to={this.props.to} className={ classes } activeclassname="active" >
          { icon }
          { this.props.label }
        </Link>

    );
  }
}

IfefTab.propTypes = {
  customclasses: PropTypes.string,
  active: PropTypes.bool,
  label: PropTypes.string,
  icon: PropTypes.string,
  to: PropTypes.string.isRequired
};

IfefTab.defaultProps = {
  customClasses: '',
  active: false,
  label: null,
  icon: null,
  to: null
};

export default IfefTab;
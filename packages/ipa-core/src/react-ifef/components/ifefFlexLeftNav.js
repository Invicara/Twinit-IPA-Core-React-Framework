import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefFlexLeftNav extends React.Component {

  render() {
    let classes = classnames(this.props.customClasses);
    return (
      <div className={ classes }>
          {this.props.children}
      </div>
    );
  }
}

IfefFlexLeftNav.propTypes = {
    customClasses: PropTypes.string
};

IfefFlexLeftNav.defaultProps = {
    customClasses: ''
};

export default IfefFlexLeftNav;

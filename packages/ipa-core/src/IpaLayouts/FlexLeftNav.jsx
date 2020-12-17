import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class FlexLeftNav extends React.Component {

  render() {
    let classes = classnames(this.props.customClasses);
    return (
      <div className={ classes }>
          {this.props.children}
      </div>
    );
  }
}

FlexLeftNav.propTypes = {
    customClasses: PropTypes.string
};

FlexLeftNav.defaultProps = {
    customClasses: ''
};

export default FlexLeftNav;

import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefList extends React.Component {
 
  render() {
    var classes = classnames(
      {'list': true,
        'list-inset': this.props.inset},
      this.props.customClasses
    );
    return (
      <div className={classes}>
        {this.props.children}
      </div>
    );
  }
}

IfefList.propTypes = {
  customClasses: PropTypes.string,
  inset: PropTypes.bool
};

IfefList.defaultProps = {
  customClasses: '',
  inset: false
};

export default IfefList;

// TODO: Implement sortable / swipe functionality
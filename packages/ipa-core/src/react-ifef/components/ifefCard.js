import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefCard extends React.Component {


  render() {
    // extract props used here, pass on the rest
    var { list, customClasses, ...other } = this.props;
    var classes = classnames(
      {'card': true,
       'list' : list},
      customClasses
    );
    return (
        <div className={classes} {...other}>
        {this.props.children}
      </div>
    );
  }
}

IfefCard.propTypes = {
  customClasses: PropTypes.string,
  list: PropTypes.bool
};

IfefCard.defaultProps = {
  customClasses: '',
  list: false
};

export default IfefCard;
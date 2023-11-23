import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefTitle extends React.Component {

  render() {
    var platform = this.context.ifefPlatform;
    var classes = classnames(
      {'title': true},
      {'title-section': true},
      this.props.customClasses,
      {'title-left': this.props.marginCompensation > 0}
    );

    var styles = this.props.marginCompensation ? {"marginLeft": this.props.marginCompensation} : {};
    return (

        <h1 className={ classes } style={ styles } >
          { this.props.children }
        </h1>

    );
  }
}

IfefTitle.propTypes = {
  customClasses: PropTypes.string,
  marginCompensation: PropTypes.number
};

IfefTitle.defaultProps = {
  customClasses: '',
  marginCompensation: 0
};

IfefTitle.contextTypes = {
  ifefPlatform: PropTypes.object,
  ifefNavDirection: PropTypes.string,
  ifefSetTransitionDirection: PropTypes.func
};
export default IfefTitle;

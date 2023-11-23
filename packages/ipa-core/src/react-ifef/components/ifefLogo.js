import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefLogo extends React.Component {

  render() {
    let classes = classnames(this.props.customClasses);

    return (
        <div id="logo" className={ classes }>{this.props.children?this.props.children:<a href={this.props.homepage}> <img src={require('./img/invicara-logo_white.svg')}/></a>}</div>
    );
  }
}

IfefLogo.propTypes = {
  customClasses: PropTypes.string,
  homepage: PropTypes.string
};

IfefLogo.defaultProps = {
  customClasses: ''
};

export default IfefLogo;

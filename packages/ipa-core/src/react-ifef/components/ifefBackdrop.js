import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import {CSSTransition} from 'react-transition-group';

class IfefBackdrop extends React.Component {
  
  render() {
    var backdrop;
    if (this.props.show) {
      backdrop = <div className="backdrop visible active"></div>;
    } else {
      backdrop = <div className="backdrop" />;
    }
    var classes = classnames(
      {'backdrop': true},
      this.props.customClasses
    );
    var props = this.props;
    return (
      <CSSTransition
      in={props.show}
      timeout={100}
      classNames={{
        enter: 'backdrop-invisible',
        enterActive: 'backdrop-visible'
      }}
      >
        {backdrop}
      </CSSTransition>
    );
  }
}

IfefBackdrop.propTypes = {
  customclasses: PropTypes.string,
  show: PropTypes.bool
};

IfefBackdrop.defaultProps = {
  customclasses: '',
  show: false
};


export default IfefBackdrop;
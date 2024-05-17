import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import IfefTitle from './ifefTitle';

import { LeftButtonContainer } from '../helpers/containers';

class IfefNavBar extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      marginCompensation: 0
    };

    this.setMarginCompensation = this.setMarginCompensation.bind(this);

  }


  setMarginCompensation(width) {
    if (this.context.ifefPlatform.isAndroid) {
      this.setState({'marginCompensation': Math.ceil(width) + 10 });
    }
  };

  componentDidMount() {
    this.context.ifefUpdateHasX('ifefHasHeader', true);
  }

  componentWillUnmount() {
    /* Can't really do this cuz unmount of transitioned page comes after mount of new one
    // jl 03/02/18
    this.context.ifefUpdateHasX('ifefHasHeader', false);
    */
  }

  render() {
    var platform = this.context.ifefPlatform;
    var leftButton = this.props.leftButton;
    var classes = classnames(
      {'bar': true, 'bar-header': true},
      this.props.customClasses || 'bar-stable', // default class
      'nav-bar-block',
      {'nav-bar-transition-android': platform.isAndroid,
       'nav-bar-transition-ios': !platform.isAndroid
      },
      'nav-bar-direction-' + this.context.ifefNavDirection
    );
    return (

      <div className={classes}>


        <LeftButtonContainer setMarginCompensation={this.setMarginCompensation}>
          {leftButton ? leftButton : <div/>}
        </LeftButtonContainer>

        <IfefTitle marginCompensation={this.state.marginCompensation} customClasses="title-stage">
            { this.props.title ? this.props.title : ""}
        </IfefTitle>


        {this.props.rightButton ? this.props.rightButton : <div/>}


      </div>
    );
  }
}

IfefNavBar.propTypes = {
  customClasses: PropTypes.string,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  leftButton: PropTypes.element,
  leftButtonColor: PropTypes.string,
  rightButton: PropTypes.element
};

IfefNavBar.defaultProps = {
  customClasses: '',
  title: '',
  leftButton: null,
  rightButton: null
};

IfefNavBar.contextTypes = {
  ifefPlatform: PropTypes.object,
  ifefUpdateHasX: PropTypes.func,
  ifefSetTransitionDirection: PropTypes.func,
  ifefNavDirection: PropTypes.string
};


export default IfefNavBar;

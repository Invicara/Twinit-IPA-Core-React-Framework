import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { Link } from 'react-router-dom';

class IfefButton extends React.Component {
  constructor(props) {
    super(props);
    
    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    if (this.props.backButton) {
      // set the transitionDirection for backward animation
      this.context.ifefSetTransitionDirection('back');

      // execute possible other onclick function
      if (this.props.onClick) {
        this.props.onClick(e);
      }

      // if history is set, go to previous location
      if (!this.props.link && this.context.history) {
        this.context.history.back();
      }
      // return false to prevent defaults
      return false;
    } else if (this.props.onClick) {
      this.props.onClick(e);
    }
  }

  render() {
    var colorClass = this.props.color ? 'button-' + this.props.color : null;
    var classes = classnames(
      {'button': true,
       'button-block' : this.props.expand === 'block',
       'button-full' : this.props.expand === 'full',
       'button-small' : this.props.size === 'small',
       'button-large' : this.props.size === 'large',
       'button-outline' : this.props.type === 'outline',
       'button-clear' : this.props.type === 'clear',
       'icon-left' : this.props.iconPosition === 'left',
       'icon-right' : this.props.iconPosition === 'right',
       'icon': !this.props.iconPosition && this.props.icon,
       'button-icon' : !this.props.children && this.props.icon && this.props.type === 'icon-clear'
      },
      this.props.icon,
      colorClass,
      this.props.customClasses
    );
    var button;
    if (this.props.link) {
      button = (
        <Link className={ classes } to={this.props.link} onClick={this.onClick}>
          { this.props.children }
        </Link>
      );
    } else if (this.props.href) {
      button = (
        <a className={ classes } href={this.props.href} target={this.props.target} onClick={this.onClick}>
          { this.props.children }
        </a>
      );
    } else {
      button = (
        <button type={this.props.htmlType} className={ classes } onClick={this.onClick}>
          { this.props.children }
        </button>
      );
    }
    return button;
  }
}

IfefButton.propTypes = {
  link: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  href: PropTypes.string,
  target: PropTypes.string,
  customClasses: PropTypes.string,
  expand: PropTypes.oneOf(['full', 'block']),
  size: PropTypes.oneOf(['small', 'large']),
  type: PropTypes.oneOf(['outline', 'clear', 'icon-clear']),
  icon: PropTypes.string,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  color: PropTypes.string,
  onClick: PropTypes.func,
  backButton: PropTypes.bool,
  htmlType: PropTypes.oneOf(['submit', 'button', 'reset']) // the value to put in <button type="???">
};

IfefButton.defaultProps = {
  link: null,
  href: null,
  target: null,
  customClasses: '',
  expand: null,
  size: null,
  type: null,
  icon: null,
  iconPosition: null,
  color: '',
  onClick: null,
  backButton: false,
  htmlType: null, // by default HTML will use 'submit' as the default when nothing is set.
};

IfefButton.contextTypes = {
  ifefSetTransitionDirection: PropTypes.func,
  history: PropTypes.object
};

export default IfefButton;
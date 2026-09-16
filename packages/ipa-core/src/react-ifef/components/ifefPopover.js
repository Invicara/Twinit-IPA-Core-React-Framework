import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import IfefButton from './ifefButton';
import _ from 'lodash';

const POPOVER_BODY_PADDING = 6;

class IfefPopover extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isUp: false,
      popoverBottomClass: false,
      popoverStyle: {},
      arrowStyle: {},
    };

    this.backdropClicked = this.backdropClicked.bind(this);
    this.ignoreClick = this.ignoreClick.bind(this);
  }

  backdropClicked(e) {
    e.preventDefault();
    if (e.target.className.indexOf('popover-backdrop') >= 0) {
      // if clicked on backdrop outside of the popover, close popover
      this.setState({ isUp: false });
    }
  }

  ignoreClick(e) {
    e && e.stopPropagation(); // so it won't close the popover
  }

  componentDidUpdate(prevProps, prevState) {
    // Check to see if there has been an upate to the popover
    if (
      prevProps.ifefPopover !== this.props.ifefPopover ||
      prevProps.ifefPopoverElem !== this.props.ifefPopoverElem
    ) {
      this.setState({ popoverStyle: {} }); // reset size/position
    }

    if (this.props.ifefPopoverElem && !prevState.isUp) {
      // show popover
      this.setState({ isUp: true });
    }

    if (!this.state.isUp && prevState.isUp) {
      this.props.context.ifefShowPopover(false, null);
    }

    if (
      !_.isEmpty(this.props.ifefPopover) &&
      this.props.ifefPopoverElem &&
      _.isEmpty(this.state.popoverStyle)
    ) {
      // some old skool hacks to position the popover after all is mounted
      let htmlElement = document.documentElement;
      let button = this.props.ifefPopoverElem;
      let arrow = this.arrow;
      let popover = this.popover;

      let bodyHeight = htmlElement.clientHeight;
      let bodyWidth = htmlElement.clientWidth;
      let buttonPosition = button.getBoundingClientRect();
      let buttonPositionLeft = buttonPosition.left + document.body.scrollLeft;
      let buttonPositionTop = buttonPosition.top + document.body.scrollTop;
      let buttonWidth = button.offsetWidth;
      let buttonHeight = button.offsetHeight;
      let popoverWidth = popover.offsetWidth;
      let popoverHeight = popover.offsetHeight;

      let popoverCSS = {
        marginLeft: '0px',
        opacity: 1,
        left: buttonPositionLeft + buttonWidth / 2 - popoverWidth / 2,
      };

      if (popoverCSS.left < POPOVER_BODY_PADDING) {
        popoverCSS.left = POPOVER_BODY_PADDING;
      } else if (popoverCSS.left + popoverWidth + POPOVER_BODY_PADDING > bodyWidth) {
        popoverCSS.left = bodyWidth - popoverWidth - POPOVER_BODY_PADDING;
      }

      if (buttonPositionTop + buttonHeight + popoverHeight > bodyHeight) {
        popoverCSS.top = buttonPositionTop - popoverHeight;
        this.setState({ popoverBottomClass: true });
      } else {
        popoverCSS.top = buttonPositionTop + buttonHeight;
        this.setState({ popoverBottomClass: false });
      }

      this.setState({
        arrowStyle: {
          left: buttonPositionLeft + buttonWidth / 2 - arrow.offsetWidth / 2 - popoverCSS.left,
        },
      });
      this.setState({ popoverStyle: popoverCSS });
    }
  }

  render() {
    let ifefPopover = this.props.ifefPopover;

    let willMount = true;
    if (_.isEmpty(ifefPopover)) willMount = false;

    let popOverClasses = classnames({
      'asf-popover': true,
      'asf-popover-bottom': this.state.popoverBottomClass,
    });
    let backdropClasses = classnames({
      'asf-popover-backdrop': willMount,
      active: this.props.ifefPopoverElem,
    });
    let content = null;
    if (this.props.ifefPopoverElem) {
      content = (
        <div className={backdropClasses} onClick={this.backdropClicked}>
          <div className="asf-popover-wrapper" onClick={this.ignoreClick}>
            <div
              className={popOverClasses}
              style={this.state.popoverStyle}
              ref={popover => (this.popover = popover)}
            >
              <div
                className="asf-popover-arrow"
                style={this.state.arrowStyle}
                ref={arrow => (this.arrow = arrow)}
              />
              {ifefPopover}
            </div>
          </div>
        </div>
      );
    }
    return <div>{content}</div>;
  }
}

IfefPopover.propTypes = {};

IfefPopover.defaultProps = {};

class IfefPopoverButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    this.props.context.ifefShowPopover(true, e.target);
  }

  render() {
    return <IfefButton {...this.props} onClick={this.handleClick} />;
  }
}

export default IfefPopover;
export { IfefPopoverButton };

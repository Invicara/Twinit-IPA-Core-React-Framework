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
      arrowStyle: {}
    };
    
    this.backdropClicked = this.backdropClicked.bind(this);
    this.ignoreClick = this.ignoreClick.bind(this);
  }

  backdropClicked(e) {
    e.preventDefault();
    if (e.target.className.indexOf("popover-backdrop") >= 0) {
      // if clicked on backdrop outside of the popover, close popover
      this.setState({isUp: false});
    }
  }

  ignoreClick(e) {
    e && e.stopPropagation(); // so it won't close the popover
  }
  
  componentDidUpdate(prevProps, prevState) {
    // Check to see if there has been an upate to the popover
    if (prevProps.ifefPopover !== this.props.ifefPopover ||
        prevProps.ifefPopoverElem !== this.props.ifefPopoverElem) {
      this.setState({popoverStyle: {}});    // reset size/position
    }
    
    if (this.props.ifefPopoverElem && !prevState.isUp) {
      // show popover
      this.setState({ isUp: true });
    }
    
    if (!this.state.isUp && prevState.isUp) {
      this.context.ifefShowPopover(false, null);
    }
  
    if (!_.isEmpty(this.props.ifefPopover) && this.props.ifefPopoverElem &&
        _.isEmpty(this.state.popoverStyle)) {
      // some old skool hacks to position the popover after all is mounted
      var htmlElement = document.documentElement;
      var button = this.props.ifefPopoverElem;
      var arrow = this.arrow;
      var popover = this.popover;

      var bodyHeight = htmlElement.clientHeight;
      var bodyWidth = htmlElement.clientWidth;
      var buttonPosition = button.getBoundingClientRect();
      var buttonPositionLeft = buttonPosition.left + document.body.scrollLeft;
      var buttonPositionTop = buttonPosition.top + document.body.scrollTop;
      var buttonWidth = button.offsetWidth;
      var buttonHeight = button.offsetHeight;
      var popoverWidth = popover.offsetWidth;
      var popoverHeight = popover.offsetHeight;

      var popoverCSS = {
        marginLeft: '0px',
        opacity: 1,
        left: buttonPositionLeft + buttonWidth / 2 - popoverWidth / 2
      };

      if (popoverCSS.left < POPOVER_BODY_PADDING) {
        popoverCSS.left = POPOVER_BODY_PADDING;
      } else if(popoverCSS.left + popoverWidth + POPOVER_BODY_PADDING > bodyWidth) {
        popoverCSS.left = bodyWidth - popoverWidth - POPOVER_BODY_PADDING;
      }

      if (buttonPositionTop + buttonHeight + popoverHeight > bodyHeight) {
        popoverCSS.top = buttonPositionTop - popoverHeight;
        this.setState({ popoverBottomClass: true });
      } else {
        popoverCSS.top = buttonPositionTop + buttonHeight;
        this.setState({ popoverBottomClass: false });
      }


      this.setState({ arrowStyle: { left: buttonPositionLeft + buttonWidth / 2 - arrow.offsetWidth / 2 - popoverCSS.left } });
      this.setState({ popoverStyle: popoverCSS });
    }

  }

  render() {
    var ifefPopover = this.props.ifefPopover;

    var willMount = true;
    if (_.isEmpty(ifefPopover)) willMount = false;
    
    var popOverClasses = classnames(
      {'asf-popover': true,
       'asf-popover-bottom': this.state.popoverBottomClass}
    );
    var backdropClasses = classnames(
      {'asf-popover-backdrop': willMount,
       'active': this.props.ifefPopoverElem}
    );
    var content = null;
    if (this.props.ifefPopoverElem) {
      content = (
        <div className={backdropClasses} onClick={this.backdropClicked}>
        <div className="asf-popover-wrapper" onClick={this.ignoreClick}>
        <div className={popOverClasses} style={this.state.popoverStyle} ref={popover => this.popover = popover}>
        <div className="asf-popover-arrow" style={this.state.arrowStyle} ref={arrow => this.arrow = arrow} />
        {ifefPopover}
        </div>
        </div>
        </div>
      );
    }
    return (
      <div>
      {content}
      </div>
    );
  }
}

IfefPopover.propTypes = {
};

IfefPopover.defaultProps = {
};

IfefPopover.contextTypes = {
  ifefShowPopover: PropTypes.func
};


class IfefPopoverButton extends React.Component {
  constructor(props) {
    super(props);
        
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick(e) {
    this.context.ifefShowPopover(true, e.target)
  }
  
  render() {
    return (
      <IfefButton {...this.props} onClick={this.handleClick}/>
    )
  }
}

IfefPopoverButton.contextTypes = {
  ifefShowPopover: PropTypes.func
};

export default IfefPopover;
export { IfefPopoverButton };
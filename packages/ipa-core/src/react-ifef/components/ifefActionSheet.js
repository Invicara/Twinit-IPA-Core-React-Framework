import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import transitionend from 'transitionend-property';

class IfefActionSheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isUp: false,
      callback: () => {}
    };
    
    // bind various event handlers
    this.cancelAction = this.cancelAction.bind(this);
    this.destructiveButtonClicked = this.destructiveButtonClicked.bind(this);
    this.buttonClicked = this.buttonClicked.bind(this);
    this.close = this.close.bind(this);
  }  

  cancelAction(e) {
    e && e.stopPropagation();
    this.close(this.props.ifefActionSheet.cancel);
  }

  destructiveButtonClicked(e) {
    e && e.stopPropagation();
    this.close(this.props.ifefActionSheet.destructiveButtonClicked);
  }

  buttonClicked(e, idx) {
    e && e.stopPropagation();
    this.close(this.props.ifefActionSheet.buttonClicked.bind(null, idx));
  }

  close(callback) {
    if (this.state.isUp) {
      this.setState({ isUp: false, callback: callback });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Move the componentWillUpdate handling of hiding it here.  jl 11/04/2019
    if (!_.isEmpty(prevProps.ifefActionSheet && _.isEmpty(this.props.ifefActionSheet))) {
      this.cancelAction(false);
    }

    if (_.isEmpty(prevProps.ifefActionSheet) && !_.isEmpty(this.props.ifefActionSheet)) {
      // show actionSheet
      this.setState({ isUp: true });
    }

    if (!this.state.isUp && prevState.isUp) {
      var self = this;
      var handler =  function() {
        self.context.ifefUpdateActionSheet({});
        wrapper.removeEventListener(transitionend, handler);
        if (typeof self.state.callback === 'function') {
          self.state.callback();
        }
      };
      var wrapper = this.wrapper;
      wrapper.addEventListener(transitionend, handler);
    }
  }

  /*
  componentWillUpdate(nextProps, nextState) {
    if (_.isEmpty(nextProps.ifefActionSheet) && !_.isEmpty(this.props.ifefActionSheet)) {
      // hide actionSheet
      this.cancelAction(false);
    }    
  }
  */

  render() {
    var ifefActionSheet = this.props.ifefActionSheet;

    var willMount = true;
    if (_.isEmpty(ifefActionSheet)) willMount = false;

    var titleText = ifefActionSheet.titleText;
    var destructiveText = ifefActionSheet.destructiveText;
    var cancelText = ifefActionSheet.cancelText;
    var buttons = ifefActionSheet.buttons;
    var cancel = ifefActionSheet.cancel;
    var buttonClicked = ifefActionSheet.buttonClicked;
    var destructiveButtonClicked = ifefActionSheet.destructiveButtonClicked;
    var onclickCancel = (e) => { this.cancelAction(e); };
    var onclickDelete = (e) => { this.destructiveButtonClicked(e); };

    
    titleText = titleText ? <div className="action-sheet-title">{titleText}</div> : <div/>;
    
    if (buttons) {
      let self = this;
      buttons = buttons.map(function(button, idx) {
        if (button.text) {
          return <button className="button" key={idx} onClick={(e) => self.buttonClicked(e, idx)}>{button.text}</button>;
        } else {
          return null;
        }
      });
    } else {
      buttons = <div/>
    }   
    
    destructiveText = destructiveText ? <div className="action-sheet-group"><button className="button destructive" onClick={onclickDelete}>{destructiveText}</button></div> : <div/>
    
    cancelText = cancelText ? <div className="action-sheet-group"><button className="button" onClick={onclickCancel}>{cancelText}</button></div> : <div/>
    
    
    var backdropClasses = classnames(
      {'action-sheet-backdrop': willMount, 'active': this.state.isUp}
    );
    var classes = classnames(
      {'action-sheet-wrapper': true, 'action-sheet-up': this.state.isUp}
    );
    var groupClasses = classnames(
      {'action-sheet-group': this.state.isUp}
    );

    return (
      <div className={backdropClasses} onClick={onclickCancel}>
        <div className={classes} ref={wrapper => this.wrapper = wrapper}>
          <div className="action-sheet">
            <div className={groupClasses}>
              {titleText}
              {buttons}
            </div>
            {destructiveText}
            {cancelText}
          </div>
        </div>
      </div>
    );
  }
}

IfefActionSheet.contextTypes = {
  ifefUpdateActionSheet: PropTypes.func
};

export default IfefActionSheet;
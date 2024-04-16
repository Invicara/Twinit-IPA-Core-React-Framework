import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import _ from 'lodash';

class IfefPopup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isUp: false,
      closing: false,
      callback: () => {},
      inputValue: '' // needed for prompt
    }

    this.timeout = null;

    this.buttonClicked = this.buttonClicked.bind(this);
  }


  buttonClicked(e, callback) {
    e && e.stopPropagation();
    this.close(callback);
  }

  close(callback) {
    if (this.state.isUp) {
      this.setState({ closing: true, callback: callback });
    }
  }
  
  setTimeout(f, duration) {
    this.timeout = setTimeout(f, duration)
  }
  
  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout); 
    }
  }

  componentDidUpdate(prevProps) {
    // Break out if the popup isUp (otherwise it just keeps looping here and esceeds react max)
    if (_.isEmpty(prevProps.ifefPopup) && !_.isEmpty(this.props.ifefPopup) && !this.state.isUp) {
      // show popup
      this.setState({ isUp: true });
    }
    
    if (this.state.isUp && this.state.closing) {
      var self = this;
      var handler =  function() {
        self.setState({ isUp: false, closing: false });
        self.context.ifefUpdatePopup({});
        if (typeof self.state.callback === 'function') {
          self.state.callback();
        }
      };
      this.setTimeout(handler, 100);
    }
  }

  handleFormChange(e) { // needed for prompt
    this.setState({ inputValue: e.target.value });
  }

  render() {
    var ifefPopup = this.props.ifefPopup;

    var willMount = true;
    if (_.isEmpty(ifefPopup)) willMount = false;

    var title = ifefPopup.title;
    var subTitle = ifefPopup.subTitle;
    var template = ifefPopup.template;
    var buttons = ifefPopup.buttons;
    var cancel = ifefPopup.cancel;
    var popupType = ifefPopup.popupType;
    var customClasses = ifefPopup.customClasses;
    var onclickCancel = (e) => { this.cancelAction(e); };

    switch(popupType) {
    case 'alert':
      buttons = [
        {
          text: ifefPopup.okText ? ifefPopup.okText : 'Ok',
          type: ifefPopup.okType ? ifefPopup.okType : 'button-positive',
          onTap: function(event) {
            if (ifefPopup.onOk) ifefPopup.onOk(event);
            return true;
          }
        }
      ];
      break;
    case 'confirm':
      buttons = [
        {
          text: ifefPopup.cancelText ? ifefPopup.cancelText : 'Cancel',
          type: ifefPopup.cancelType ? ifefPopup.cancelType : 'button-default',
          onTap: function (event) {
            if (ifefPopup.onCancel) ifefPopup.onCancel(event);
            return true;
          }
        },
        {
          text: ifefPopup.okText ? ifefPopup.okText : 'Ok',
          type: ifefPopup.okType ? ifefPopup.okType : 'button-positive',
          onTap: function (event) {
            if (ifefPopup.onOk) ifefPopup.onOk(event);
            return true;
          }
        }
      ];
      break;
    case 'prompt':
      template =  <span className="popup-prompt-text">{template}</span>;

      ifefPopup.inputType = ifefPopup.inputType || 'text';
      ifefPopup.inputPlaceholder = ifefPopup.inputPlaceholder || '';
      template = <span>{template}<input type={ifefPopup.inputType} placeholder={ifefPopup.inputPlaceholder} value={this.state.inputValue} onChange={this.handleFormChange} /></span>;
      var self = this;
      buttons = [
        {
          text: ifefPopup.cancelText ? ifefPopup.cancelText : 'Cancel',
          type: ifefPopup.cancelType ? ifefPopup.cancelType : 'button-default',
          onTap: function (event) {
            if (ifefPopup.onCancel) ifefPopup.onCancel(event);
            return true;
          }
        },
        {
          text: ifefPopup.okText ? ifefPopup.okText : 'Ok',
          type: ifefPopup.okType ? ifefPopup.okType : 'button-positive',
          onTap: function(event) {
            if (ifefPopup.onOk) ifefPopup.onOk(event, self.state.inputValue);
            return true;
          }
        }
      ];

      break;
    default:
      // we assume the type is 'show', no need to do anything
    }

    var head = null;
    if (title || subTitle) {
      head = (
          <div className="asf-popup-head">
            {title ? <h3 className="asf-popup-title">{title}</h3> : null}
            {subTitle ? <h5 className="asf-popup-sub-title">{subTitle}</h5> : null}
          </div>
      );
    }
    if (template) {
      template = <div className="asf-popup-body">{template}</div>
    }
    if (buttons) {
      let self = this;
      buttons = buttons.map(function(button, idx) {
        if (button.text) {
          let buttonClass = classnames('button', button.type);
          let callback = button.onTap;
          return <button className={buttonClass} key={idx} onClick={(e) => self.buttonClicked(e, callback)}>{button.text}</button>;
        } else {
          return null;
        }
      });
      buttons = <div className="asf-popup-buttons">{buttons}</div>
    }

    var backdropClasses = classnames(
      {'backdrop': willMount, 'visible active': this.state.isUp}
    );
    var classes = classnames(
      {'asf-popup-container': willMount, 'asf-popup-showing': this.state.isUp, 'active': this.state.isUp && !this.state.closing, 'asf-popup-hidden': this.state.closing}
    );
    var popupClasses = classnames(
      'asf-popup',
      customClasses
    );

    return (
      <div className={backdropClasses}>
        <div className={classes}>
          <div className={popupClasses}>
            {head}
            {template}
            {buttons}
          </div>
        </div>
      </div>
    );
  }
}

IfefPopup.contextTypes = {
  ifefUpdatePopup: PropTypes.func
}

export default IfefPopup;
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import {CSSTransition} from 'react-transition-group';

class IfefModalContainer extends React.Component {
  // this component need to be attached to the DOM before the Modal enters
  // otherwise the transitions won't work

  render() {
    let classes = classnames('asf-modal-container', this.props.animation,this.context.ifefModalOpen?'modal-opened':'' );
    return (

        <CSSTransition
                timeout={500}
                in={this.context.ifefModalOpen ? true : false}
                classNames={this.props.animation}

        >
          <div className={classes}>
                {(this.context.ifefModal) ? this.context.ifefModal : <div/>}
          </div>
        </CSSTransition>

    );
  }
}


IfefModalContainer.propTypes = {
  animation: PropTypes.string
};

IfefModalContainer.defaultProps = {
  animation: 'slide-in-up'
};


IfefModalContainer.contextTypes = {
  ifefModal: PropTypes.oneOfType([PropTypes.object,PropTypes.bool]),
  ifefModalOpen: PropTypes.bool
}

class IfefModal extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.backdropClicked = this.backdropClicked.bind(this);
  }

  backdropClicked(e) {
      let targetClassName = e.target.className;
      if (targetClassName && typeof targetClassName === 'string' && targetClassName.indexOf("asf-modal-backdrop") >= 0) {
      // if clicked on backdrop outside of the modal, close modal
      e.preventDefault();
      this.context.ifefShowModal(false);
    }
  };

  componentDidMount() {
    if(this.props.focusFirstInput) {
      var input = document.querySelector("input"); // select first input
      input && input.focus();
    }
  }

  componentWillUnmount() {
    // Catch the end of the transition

  }

  render() {
    var classes = classnames(
      {'asf-modal': true},
      this.props.customClasses
    );
    var backdropClasses = classnames(
      {'asf-modal-backdrop': true,
       'active': this.props.children}
    );
    var barClasses = classnames(
      'bar bar-header',
      this.props.barClasses
    );
    var titleClasses = classnames(
      {'title': true,
       'title-left': this.context.ifefPlatform.isAndroid}
    );
    var closeButton;
    if (this.props.closeText) {
      closeButton = <button onClick={ () => this.props.closeButtonHandler ? this.props.closeButtonHandler() : this.context.ifefShowModal(false) } className="button button-positive button-clear">{this.props.closeText}</button>;
    } else {
      closeButton = <button onClick={ () => this.props.closeButtonHandler ? this.props.closeButtonHandler() : this.context.ifefShowModal(false) } className="button button-icon"><i className="icon ion-ios-close-empty"></i></button>;
    }
    var contents;
    if (this.props.customTemplate) {
      contents = (
        <div className={classes}>
          {this.props.children}
        </div>
      );
    } else {
      contents = (
        <div className={classes}>
          <div className={barClasses}>
            <h2 className={titleClasses}>{this.props.title}</h2>{closeButton}
          </div>
          <div className="content has-header overflow-scroll">
            {this.props.padding
              ? <div className="padding">
                {this.props.children}
              </div>
              : this.props.children
            }
          </div>
        </div>
      );
    }
    return (
        <div className={backdropClasses} onClick={this.backdropClicked}>
          <div className="asf-modal-wrapper">
            {contents}
          </div>
        </div>


    );
  }
}

IfefModal.propTypes = {
  customClasses: PropTypes.string,
  customTemplate: PropTypes.bool,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  closeText: PropTypes.string,
  focusFirstInput: PropTypes.bool,
  barClasses: PropTypes.string,
  padding: PropTypes.bool,
};

IfefModal.defaultProps = {
  customClasses: '',
  customTemplate: false,
  title: '',
  closeText: '',
  focusFirstInput: true,
  barClasses: 'bar-stable',
  padding: true,
};

IfefModal.contextTypes = {
  ifefShowModal: PropTypes.func,
  ifefKeyboardHeight: PropTypes.number,
  ifefPlatform: PropTypes.object
};

export default IfefModal;
export { IfefModalContainer };

// @@@@@@@@@@@@@@@@ implement dynamic stuff ???

// Fix default template, see Meteoric

import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import {IfefModalContainer} from './ifefModal';
import IfefActionSheet from './ifefActionSheet';
import IfefPopover from './ifefPopover';
import IfefPopup from './ifefPopup';
import IfefBackdrop from './ifefBackdrop';
import IfefLoading from './ifefLoading';
import IfefKeyboard from '../helpers/keyboard';
import _ from 'lodash';
import BodyProvider, {BodyContext} from './bodyProvider'

class IfefBody extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ifefNavDirection: 'forward', // can be either forward or back, only used for IfefNav* components
      ifefModal: false, // can be either false or contain the modal node
      ifefModalOpen: false,   // split the set from the show for proper animation. jl 10/19/19
      ifefPopover: {}, // can be set separate from show or contain the popover
      ifefPopoverElem: null,  // set to control placement of popover
      ifefShowPopover: false, // set/show of Popover now separate; jl 04/15/18
      ifefActionSheet: {},
      ifefPopup: {},
      ifefBackdrop: false,
      ifefLoading: false,
      ifefKeyboardHeight: 0,

      ifefSnapper: null,
      ifefKeyboard: {},
    };
  }

  render() {
    var platform = this.props.platform;
    var classes = classnames({
      'asf-body': true,
      'grade-a': true, // needs improvement https://github.com/delta98/ifefic-platform-body-classes
      'platform-cordova': platform.isCordova,
      'platform-ios': platform.isIOS,
      'platform-android': platform.isAndroid,
      'modal-open': this.state.ifefModalOpen,
      'action-sheet-open': !_.isEmpty(this.state.ifefActionSheet),
      'popup-open': !_.isEmpty(this.state.ifefPopup),
      'keyboard-open': this.state.ifefKeyboardHeight
    });
    
    return (
      <BodyProvider location={this.props.location} history={this.props.history} platform={this.props.platform}>
        <div className={classes}>
          { this.props.children }
          <BodyContext.Consumer>
          {
             (contextProps) => {
              return (<div>
                <IfefModalContainer ifefModal={this.state.ifefModal}><div/></IfefModalContainer>
                <IfefBackdrop show={this.state.ifefBackdrop} />
                <IfefLoading show={this.state.ifefLoading} context={contextProps} />
                <IfefActionSheet ifefActionSheet={this.state.ifefActionSheet} context={contextProps} />
                <IfefPopup ifefPopup={this.state.ifefPopup} context={contextProps} />
                <IfefPopover
                  ifefPopover={this.state.ifefPopover}
                  ifefPopoverElem={this.state.ifefPopoverElem} 
                  context={contextProps} />
              </div>
              )
             }
            }
          </BodyContext.Consumer>
        
        </div>
      </BodyProvider>
    );
  }
}

IfefBody.propTypes = {
  platform: PropTypes.object,
  location: PropTypes.object.isRequired
};

IfefBody.defaultProps = {
  platform: {
    isIOS: false,
    isAndroid: false,
    isCordova: false,
    transitionTimeOut: 450,
    name: 'Web'
  }
};


export default IfefBody;

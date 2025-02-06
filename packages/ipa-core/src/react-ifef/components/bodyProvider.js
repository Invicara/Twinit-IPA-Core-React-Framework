import PropTypes from 'prop-types';
import React from 'react';
import IfefKeyboard from '../helpers/keyboard';
import _ from 'lodash';

export const BodyContext = React.createContext()

class BodyProvider extends React.Component {
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

    this.ifefSetTransitionDirection = this.ifefSetTransitionDirection.bind(this);

    this.ifefShowModal = this.ifefShowModal.bind(this);
    this.ifefUpdateModal = this.ifefUpdateModal.bind(this);

    this.ifefUpdateActionSheet = this.ifefUpdateActionSheet.bind(this);
    this.ifefUpdatePopup = this.ifefUpdatePopup.bind(this);
    this.ifefShowBackdrop = this.ifefShowBackdrop.bind(this);
    this.ifefShowLoading = this.ifefShowLoading.bind(this);

    this.ifefSetSnapper = this.ifefSetSnapper.bind(this);
    this.ifefUpdatePopover = this.ifefUpdatePopover.bind(this);
    this.ifefShowPopover = this.ifefShowPopover.bind(this);

    // This will close any modal, popover, popup, etc. for a transition (i.e. NavView)
    this.closeForTransition = this.closeForTransition.bind(this);
  }



  ifefSetSnapper(snapper) {
    this.setState({ ifefSnapper: snapper });
  }

  ifefSetTransitionDirection(direction) {
    // Used for setting the transition direction of the page change animations
    // Only used for IfefNav* components, but the state needs to be kept here because the IfefNavBar is
    // only encapsulated by IfefBody
    if(this.state.ifefNavDirection != direction) {
      this.setState({ifefNavDirection: direction});
    }
  }

  // Need this broken out so we can set/unset the model separate from showing it
  // so that it can properly transition on exit.  jl 10/19/19
  ifefUpdateModal (modal) {
    this.setState({ ifefModal: modal})
  }

  // Delay added when setting to false, but compatible with old entry point. jl 10/19/19
  ifefShowModal(modal) {
    let that = this;
    if (typeof modal === 'boolean' && !modal) {
      this.setState({ifefModalOpen: false});
      //setTimeout(this.ifefUpdateModal(modal), 750)
    } else {
      this.ifefUpdateModal(modal);
      this.setState({ifefModalOpen: true});
    }
  }

  ifefUpdatePopover(popover) {
    this.setState({ ifefPopover: popover})
  }

  ifefShowPopover(show, elem) {
    if (show) {
      this.setState({ ifefShowPopover: show, ifefPopoverElem: elem });
    } else {
      this.setState({ ifefShowPopover: false, ifefPopoverElem: null});
    }
  }

  ifefUpdateActionSheet(actionSheet) {
    this.setState({ ifefActionSheet: actionSheet });
  }

  ifefUpdatePopup(popup) {
    this.setState({ ifefPopup: popup });
  }

  ifefShowBackdrop(show) {
    this.setState({ ifefBackdrop: show });
  }

  ifefShowLoading(show, options={}) {
    if (show) {
      this.setState({
        ifefLoading: options
      });
    } else {
      if(this.state.ifefLoading !== false) {
        this.setState({
          ifefLoading: false
        });
      }
    }
  }

  closeForTransition() {
    if (this.state.ifefModal) { this.ifefShowModal(false); }
    if (this.state.ifefShowPopover) { this.ifefShowPopover(false); }
    if (this.state.ifefBackdrop) { this.ifefShowBackdrop(false); }
    if (this.state.ifefLoading) { this.ifefShowLoading(false); }
    if (!_.isEmpty(this.state.ifefActionSheet)) { this.ifefUpdateActionSheet({}); }
    if (!_.isEmpty(this.state.ifefPopup)) { this.ifefUpdatePopup({}); }
  }

  handleKeyboard(e) {
    var kbHeight = e && e.keyboardHeight;
    this.setState({ionKeyboardHeight: kbHeight}, function() {
      var currentModal = this.state.ifefModal;
      if (currentModal) {
        // re-render modal to include new state
        this.ifefShowModal(currentModal);
      }
    });
  }

  componentDidMount() {
    window.addEventListener('native.keyboardshow', this.handleKeyboard);
    window.addEventListener('native.keyboardhide', this.handleKeyboard);
    if (this.props.platform.isCordova && !_.isEmpty(this.state.ifefKeyboard)) {
      var keyboard = IfefKeyboard(this.props.platform);
      keyboard.disableScroll();
      this.setState({ ifefKeyboard: keyboard });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('native.keyboardshow', this.handleKeyboard);
    window.removeEventListener('native.keyboardhide', this.handleKeyboard);
  }

  render() {
    let values = {
      location: this.props.location,
      history: this.props.history,
      ifefPlatform: this.props.platform,
      ifefKeyboard: this.state.ifefKeyboard,
      ifefSetTransitionDirection: this.ifefSetTransitionDirection,
      ifefNavDirection: this.state.ifefNavDirection,
      ifefModal: this.state.ifefModal,
      ifefShowModal: this.ifefShowModal,
      ifefModalOpen: this.state.ifefModalOpen,
      ifefUpdateActionSheet: this.ifefUpdateActionSheet,
      ifefUpdatePopup: this.ifefUpdatePopup,
      ifefShowBackdrop: this.ifefShowBackdrop,
      ifefShowLoading: this.ifefShowLoading,
      ifefKeyboardHeight: this.state.ifefKeyboardHeight,

      ifefSnapper: this.state.ifefSnapper,
      ifefSetSnapper: this.ifefSetSnapper,
      ifefUpdatePopover: this.ifefUpdatePopover,
      ifefShowPopover: this.ifefShowPopover,

      ifefCloseForTransition: this.closeForTransition
    }
   
    return (
      <BodyContext.Provider value={values}>
          { this.props.children } 
      </BodyContext.Provider>
    );
  }
}

BodyProvider.propTypes = {
  platform: PropTypes.object,
  location: PropTypes.object.isRequired
};

BodyProvider.defaultProps = {
  platform: {
    isIOS: false,
    isAndroid: false,
    isCordova: false,
    transitionTimeOut: 450,
    name: 'Web'
  }
};

export default BodyProvider;
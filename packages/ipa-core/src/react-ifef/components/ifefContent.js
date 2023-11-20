import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefContent extends React.Component {

  render() {    
    var classes = classnames(
      {'content': true},
      this.props.customClasses,
      this.props.scroll !== false ? "overflow-scroll" : "no-scroll",
      {
        'has-header': this.context.ifefHasHeader,
        'has-subheader': this.context.ifefHasSubheader,
        'has-tabs': this.context.ifefHasTabs,
        'has-tabs-top': this.context.ifefHasTabsTop,
        'has-footer': this.context.ifefHasFooter,
        'has-subfooter': this.context.ifefHasSubfooter
      }
    );
    var divStyle = {};
    if (this.context.ifefKeyboardHeight > 0) {
      divStyle = { bottom: this.context.ifefKeyboardHeight };
    }

    var outerClasses = classnames(
      'scroll-content',
      { 'ios-top-margin': !this.context.ifefHasHeader }
    );

    // Adjust the height for the header, which was not being done before.  jl 05/14/2019
    var sideMenuContent = document.getElementById('IfefSidePanelContent');


    // made 'dragSidePanel' control 'data-snap-ignore' on snap drawer; default: false.  jl 12/22/2018

    return (      
      <div className={ outerClasses } style={divStyle}>
        <div className={ classes } data-snap-ignore={this.props.dragSidePanel ? undefined : "true"}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

IfefContent.propTypes = {
  customClasses: PropTypes.string,
  scroll: PropTypes.bool,
  dragSidePanel: PropTypes.bool
};

IfefContent.defaultProps = {
  customClasses: '',
  scroll: true,
  dragSidePanel: false
};

IfefContent.contextTypes = {
  ifefHasHeader: PropTypes.bool,
  ifefHasSubheader: PropTypes.bool,
  ifefHasTabs: PropTypes.bool,
  ifefHasTabsTop: PropTypes.bool,
  ifefHasFooter: PropTypes.bool,
  ifefHasSubfooter: PropTypes.bool,
  ifefKeyboardHeight: PropTypes.number
};

export default IfefContent;
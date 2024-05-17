import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefView extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      ifefHasTabs: false,
      ifefHasTabsTop: false,
      ifefHasHeader: false,
      ifefHasSubheader: false,
      ifefHasFooter: false,
      ifefHasSubfooter: false
    }
    
    this.ifefUpdateHasX = this.ifefUpdateHasX.bind(this);
  }
  
  getChildContext() {
    return {
      ifefUpdateHasX: this.ifefUpdateHasX,
      ifefHasTabs: this.state.ifefHasTabs,
      ifefHasTabsTop: this.state.ifefHasTabsTop,
      ifefHasHeader: this.state.ifefHasHeader,
      ifefHasSubheader: this.state.ifefHasSubheader,
      ifefHasFooter: this.state.ifefHasFooter,
      ifefHasSubfooter: this.state.ifefHasSubfooter
    }
  }
  
  ifefUpdateHasX(hasX, value) {
    if (hasX in this.state) {
      this.setState({ [hasX]: value });
    }
  }

  componentWillUnmount() {
    if (this.context.ifefSetTransitionDirection) {
      this.context.ifefSetTransitionDirection('forward');
    }
  }

  render() {
    var classes = classnames(
      {'view': true},
      this.props.customClasses
    );
    return (
      <div className={ classes } >
        { this.props.children }
      </div>
    );
  }
}

IfefView.propTypes = {
  customClasses: PropTypes.string
};

IfefView.defaultProps = {
  customClasses: ''
};

IfefView.contextTypes = {
  ifefSetTransitionDirection: PropTypes.func,
};

IfefView.childContextTypes = {
  ifefUpdateHasX: PropTypes.func,
  ifefHasTabs: PropTypes.bool,
  ifefHasTabsTop: PropTypes.bool,
  ifefHasHeader: PropTypes.bool,
  ifefHasSubheader: PropTypes.bool,
  ifefHasFooter: PropTypes.bool,
  ifefHasSubfooter: PropTypes.bool
};

export default IfefView;
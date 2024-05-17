import PropTypes from 'prop-types';
import React from 'react';
import IfefSpinner from './ifefSpinner';


class IfefLoading extends React.Component {
  constructor(props) {
    super(props);

    this.timeout = null;
  }

  getOptions(props) {
    if (props.show === false) { return false; }
    // merge default options with user options
    var options = Object.assign({
      duration: null,
      customTemplate: null,
      backdrop: false
    }, props.show);
    return options;
  }

  setTimeout(f, duration) {
    this.timeout = setTimeout(f, duration)
  }

  clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = null;
  }

  componentWillUnmount() {
    this.clearTimeout();
  }

  /* Removing this "UNSAFE" life cycle call.  Also no longer support "delay" prop.  jl 11/05/2019

  componentWillReceiveProps(nextProps) {
    if (this.props.show !== false && nextProps.show === false) {
      // we will shop loading, so hide a potential backdrop
      this.context.ifefShowBackdrop(false);
      // also clear possible timeouts
      this.clearTimeout();
    } else if (this.props.show === false && nextProps.show !== false) {
      // we will start loading, so introduce delay, show the backdrop, etc. if desired
      var nextOptions = this.getOptions(nextProps);
      if(nextOptions.duration > 0 && nextOptions.duration < nextOptions.delay) {
        console.warn("IfefLoading: duration should be longer than delay");
        this.context.ifefShowLoading(false);
        return;
      }
      if(nextOptions.delay > 0) {
        this.setState({wait: true});
        this.setTimeout(() => this.setState({wait:false}), nextOptions.delay);
      }
      if(nextOptions.backdrop) {
        this.setTimeout(() => this.context.ifefShowBackdrop(true), nextOptions.delay);
      }
      if(nextOptions.duration > 0) {
        this.setTimeout(() => this.context.ifefShowLoading(false), nextOptions.duration);
      }
    }
  }
  */

  componentDidUpdate(prevProps) {
    let options = this.getOptions(prevProps);
    if(options.duration > 0) {
      this.setTimeout(() => this.context.ifefShowLoading(false), options.duration);
    }
  }

  render() {
    var loading;
    if (this.props.show !== false) {
      var options = this.getOptions(this.props);
      var template = options.customTemplate || (
        <IfefSpinner
            icon="ios-small"
            customClasses="inloader spinner-light" />
      );
      loading = (
        <div className="loading-container visible active">
          <div className="loading">
            {template}
          </div>
        </div>
      );
    } else {
      loading = <div className="loading-container"></div>;
    }
    return loading;
  }
}

IfefLoading.propTypes = {
  show: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ])
}

IfefLoading.defaultProps = {
    show: "false"
}

IfefLoading.contextTypes = {
    ifefShowBackdrop: PropTypes.func,
    ifefShowLoading: PropTypes.func
}

export default IfefLoading;

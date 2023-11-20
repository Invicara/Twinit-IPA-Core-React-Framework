import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefRange extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      value: this.props.defaultValue > this.props.max ? this.props.max : this.props.defaultValue
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.disableSnap = this.disableSnap.bind(this);
    this.enableSnap = this.enableSnap.bind(this);
  }

  handleChange(event) {
    if(this.props.handleChange)
      this.props.handleChange(event.target.value);

    this.setState({
      value: event.target.value
    });
  }

  disableSnap() {
    this.context.ifefSnapper.disable();
  }

  enableSnap() {
    this.context.ifefSnapper.enable();
  }

  render() {
    var classes = classnames(
      {'item':true},
      {'range':true},
      this.props.customClasses
    );
    return (
      <div className={classes}>
          {this.props.iconBeforeInput}
          <input type='range' min={this.props.min} max={this.props.max}
                 value={this.state.value}
                 onChange={this.handleChange}
                 onMouseEnter={this.disableSnap}
                 onMouseLeave={this.enableSnap}
                 onTouchStart={this.disableSnap}
                 onTouchEnd={this.enableSnap}/>
          {this.props.iconAfterInput}
          {this.props.children}
      </div>
    );
  }
}

IfefRange.propTypes = {
  customClasses: PropTypes.string,
  defaultValue: PropTypes.number,
  handleChange: PropTypes.func,
  iconBeforeInput:PropTypes.element,
  iconAfterInput: PropTypes.element,
  min: PropTypes.number,
  max: PropTypes.number
};

IfefRange.contextTypes = {
  ifefSnapper: PropTypes.object
};

IfefRange.defaultProps = {
  customClasses: '',
  defaultValue: 0,
  handleChange: () => {},
  iconBeforeInput:null,
  iconAfterInput: null,
  min: 0,
  max: 100
};

export default IfefRange;
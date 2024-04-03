import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefItemRadio extends React.Component {
  constructor(props) {
    super(props);
    
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, value) {
    // to make this work on iOS devices, the input.onChange event
    // was replaced by an onClick event on the label element. 
    e.preventDefault();
    if (this.props.handleChange)
      this.props.handleChange(this.props.name, value);
  }

  render() {
    var classes = classnames(
      {'item-content': true},
      this.props.customClasses
    );
    var iconClasses = 'radio-icon ifef-' + this.props.icon;
    return (
      <label className="item item-radio"
             onClick={(e) => {this.handleChange(e, this.props.value)}} >
	<input type="radio"
               onChange={() => {}}
               name={this.props.name}
               checked={this.props.checked} />
        <div className="radio-content">
	  <div className={classes}>
	    {this.props.label}
	  </div>
	  <i className={iconClasses}></i>
        </div>
      </label>
    );
  }
}

IfefItemRadio.propTypes = {
  'checked': PropTypes.bool,
  'name': PropTypes.string,
  'value': PropTypes.string,
  'handleChange': PropTypes.func,
  'icon': PropTypes.string,
  'label': PropTypes.string,
  'customClasses': PropTypes.string
};

IfefItemRadio.defaultProps = {
  'checked': false,
  'name': 'radio-group',
  'value': '',
  'handleChange': () => {},
  'icon': 'checkmark',
  'label': '',
  'customClasses': ''
};

export default IfefItemRadio;
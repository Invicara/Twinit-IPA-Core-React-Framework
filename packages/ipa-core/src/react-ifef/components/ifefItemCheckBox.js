import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefItemCheckBox extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      checked: this.props.checked
    };
    
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    var toggle = this.state.checked ? false : true;
    if (this.props.handleChange)
      this.props.handleChange(toggle);
    this.setState({
      checked: toggle
    });
  }

  render() {
    var classes = classnames(
      {'checkbox': true},
      'checkbox-' + this.props.color,
      this.props.customClasses
    );
    return (
      <div className='item item-checkbox'>
	<label className={classes}>
	  <input type="checkbox" checked={this.state.checked} onChange={this.handleChange} />
	</label>
	{this.props.label}			
      </div>
    );
  }
}

IfefItemCheckBox.propTypes = {
  'checked': PropTypes.bool,
  'handleChange': PropTypes.func,
  'color': PropTypes.string,
  'label': PropTypes.string,
  'customClasses': PropTypes.string
};

IfefItemCheckBox.defaultProps = {
  'checked': false,
  'handleChange': () => {},
  'color': 'stable',
  'label': '',
  'customClasses': ''
};

export default IfefItemCheckBox;
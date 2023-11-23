import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefItemToggle extends React.Component {
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
      {'toggle': true},
      'toggle-' + this.props.color,
      this.props.customClasses
    );
    return (
      <div className='item item-toggle'>
        {this.props.label}			
	<label className={classes}>
	  <input type="checkbox" checked={this.state.checked} onChange={this.handleChange} />
          <div className='track'>
	    <div className='handle'></div>
	  </div>
	</label>
      </div>
    );
  }
}


IfefItemToggle.propTypes = {
  'checked': PropTypes.bool,
  'handleChange': PropTypes.func,
  'color': PropTypes.string,
  'label': PropTypes.node,
  'customClasses': PropTypes.string
};

IfefItemToggle.defaultProps = {
  'checked': false,
  'handleChange': () => {},
  'color': 'stable',
  'label': '',
  'customClasses': ''
};

export default IfefItemToggle;
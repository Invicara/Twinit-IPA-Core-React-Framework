import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

class IfefCheckBox extends React.Component {
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
      {'asf-checkbox': true},
      'asf-checkbox-' + this.props.color,
      this.props.customClasses
    );
    return (
      <div className={classes}>
    	  <input type="checkbox" checked={this.state.checked} onChange={this.handleChange} />
      </div>
    );
  }
}

IfefCheckBox.propTypes = {
  'checked': PropTypes.bool,
  'handleChange': PropTypes.func,
  'color': PropTypes.string,
  'customClasses': PropTypes.string,
};

IfefCheckBox.defaultProps = {
  'checked': false,
  'handleChange': () => {},
  'color': 'stable',
  'customClasses': '',
};

export default IfefCheckBox;
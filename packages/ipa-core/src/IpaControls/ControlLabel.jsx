import { object, string } from 'prop-types'
import React from 'react';
import './ControlLabel.scss' 

const ControlLabel = (props) => (
  <label style={props.style} className={`control-label ${props.className}`}>
    {props.text}
  </label>
)

ControlLabel.propTypes = {
    style: object,
    text: string,
    className: string,
}

export default ControlLabel;

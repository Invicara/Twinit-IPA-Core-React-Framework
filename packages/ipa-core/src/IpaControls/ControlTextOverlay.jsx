import React from 'react';
import './ControlTextOverlay.scss'

const ControlTextOverlay = (props) => 
<div style={props.style} className={`control-text-overlay ${props.className || ""} ${props.children && 'control-text-overlay--wrapping'}`}>
    {props.children}
    {
        !props.hide && <p style={props.textStyle} className={`control-text-overlay__text ${props.textClassName || ''}`}>
            {props.text}
        </p>
    }
</div>

export default ControlTextOverlay
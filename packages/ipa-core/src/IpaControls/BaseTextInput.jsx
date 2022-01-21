import React from 'react';
import { any, bool, func, object, string } from 'prop-types';
import './BaseTextInput.scss'

const BaseTextInput = (props) => {


    return <div className={`base-text-input ${props.className}`}>
        {props.labelProps && <label style={props.labelProps.style} className={props.labelProps.className}>{props.labelProps.text}</label>}
        <input
            type={props.inputProps.type}
            value={props.inputProps.value}
            onChange={props.inputProps.onChange}
            placeholder={props.inputProps.placeholder}
            disabled={props.inputProps.disabled}
            className={`form-control ${props.inputProps.className}`}
            style={props.style}>
        </input>
        {props.children}
    </div>
}


BaseTextInput.propTypes = {
    className: string,
    labelProps: {
        style: object,
        text: string
    },
    inputProps: {
        type: string,
        value: any,
        onChange: func,
        placeholder: string,
        disabled: bool,
        className: string,
        style: object,
    }
}


export default BaseTextInput
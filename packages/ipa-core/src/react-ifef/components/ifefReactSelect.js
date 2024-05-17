import React from 'react';
import Select from 'react-select';
import isTouchDevice from "is-touch-device";

export default class IfefReactSelect extends React.Component {
    constructor( props ) {
        super( props );
        this.isTouchDevice = isTouchDevice();
    }

    render() {
        const { touchConfig, ...otherProps } = this.props;
        const touchConfigProps = this.isTouchDevice && touchConfig ? touchConfig : {};
        return (<Select {...otherProps} {...touchConfigProps}/>);
    }
}
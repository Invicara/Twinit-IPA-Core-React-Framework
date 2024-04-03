import React, { useState } from 'react';
import BaseTextInput from '../../IpaControls/BaseTextInput';
import ControlTextOverlay from '../../IpaControls/ControlTextOverlay';
import { bool } from 'prop-types';
import './EntityModalTextInput.scss';

const EntityModalTextInput = (props) => {

    const [isFocused, setIsFocused] = useState(false);

    let multipleValuesCSSModifier = props.hasMultipleValues ? 'entity-modal-text-input--multiple-values' : ''
    return <>
        <ControlTextOverlay className="entity-modal-text-input__overlay" text="Multiple values" hide={!props.hasMultipleValues || isFocused}>
            <BaseTextInput
                className={`entity-modal-text-input ${multipleValuesCSSModifier}`}
                inputProps={{
                    ...props.inputProps,
                    onFocusChange: (isFocused) => {
                        props.inputProps.onFocusChange?.(isFocused);
                        setIsFocused(isFocused);
                    }
                }}
                labelProps={{
                    ...props.labelProps,
                    className: `entity-modal-text-input__label ${props.labelProps.className}`,
                }}
                component={props.component}
            />
        </ControlTextOverlay>
    </>
}

EntityModalTextInput.propTypes = {
    ...BaseTextInput.propTypes,
    hasMultipleValues: bool
}

export default EntityModalTextInput
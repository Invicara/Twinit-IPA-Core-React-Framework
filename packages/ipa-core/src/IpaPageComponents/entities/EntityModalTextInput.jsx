import React from 'react';
import BaseTextInput from '../../IpaControls/BaseTextInput';
import { bool } from 'prop-types';
import './EntityModalTextInput.scss';

const EntityModalTextInput = (props) => {


    let multipleValuesCSSModifier = props.hasMultipleValues ? 'entity-modal-text-input--multiple-values' : ''
    return <>
        <BaseTextInput
            className={`entity-modal-text-input ${multipleValuesCSSModifier}`}
            inputProps={{
                ...props.inputProps,
                value: props.value,
            }}
            labelProps={{
                style: { margin: '10px', fontWeight: 'bold' },
                ...props.labelProps,
            }}
        >
            {props.hasMultipleValues && <p className="entity-modal-text-input__overlay">Multiple values</p>}
        </BaseTextInput>
    </>
}

EntityModalTextInput.propTypes = {
    ...BaseTextInput.propTypes,
    multipleValues: bool
}

export default EntityModalTextInput
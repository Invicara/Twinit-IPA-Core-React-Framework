import React from "react";
import './OrDivider.scss'

export const OrDivider = ({width = '100%'}) =>
    <div className={'or-divider'} style={{width}}>
        <span className={'line'}/><span className={'text'}>OR</span><span className={'line'}/>
    </div>;
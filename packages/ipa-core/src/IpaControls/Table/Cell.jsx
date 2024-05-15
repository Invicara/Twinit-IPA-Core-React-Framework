import { Tooltip } from '@material-ui/core';
import React from 'react';
import {isValidUrl} from '../../IpaUtils/helpers'
import './Cell.scss';

const parseTextCell = (val) => {
    return isValidUrl(val) ? <a href={val} target="_blank">{val}</a> : val
}

const parseDateCell = (val) => {
    let d = new Date(val)
    return d.toLocaleDateString()
}

const parseDatetimeCell = (val) => {
    let d = new Date(val)
    return d.toLocaleString()
}

const TYPE_WITH_TOOLTIP = ["text", "date", "datetime"]

const wrapWithTooltip = (type, element) => {
    if(!TYPE_WITH_TOOLTIP.includes(type)) {
        return element
    }

    return <Tooltip key="cell-tooltip" title={element} placement="bottom-start" enterDelay={500}>{element}</Tooltip>

}



export const getCellContent = (type, val) => {
    switch(type) {
        case "text":
            return <p className="cell__content cell__content--text">{parseTextCell(val)}</p>    
        case "date":
            return <p className="cell__content cell__content--date">{parseDateCell(val)}</p> 
        case "datetime":
            return <p className="cell__content cell__content--datetime">{parseDatetimeCell(val)}</p> 
        case "tags":
            return <div className="cell__content cell__content--tags">{val.map((tag, idx) => {
                return <span key={idx} className="cell__content cell__content--tag">{tag}</span>
            })}</div>
        default:
            return val
    }
}

export default function Cell(props) {
    const cellContent = getCellContent(props.type, props.val);
    return <div className={`cell ${props.className || ""}`}>
        {wrapWithTooltip(props.type, cellContent)}
    </div>
}

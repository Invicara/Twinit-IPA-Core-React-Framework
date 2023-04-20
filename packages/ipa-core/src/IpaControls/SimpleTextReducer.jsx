import React from "react"
import { Tooltip } from "@material-ui/core"

const SimpleTextReducer = ({text, limit}) => { 

    let newText
    if (text.length > limit) {
        newText = text.substring(0, limit) + "..."
        } 

    return (
        <div>
            {newText ? <Tooltip title={text}>
                <i style={{cursor: 'pointer'}}>{newText}</i>
            </Tooltip> :
            <i>{text}</i>}
        </div>
)}

export default SimpleTextReducer
import React, {useState, useEffect} from "react"
import { Tooltip } from "@material-ui/core"

const SimpleTextReducer = ({text, limit}) => { 
    const [newText, setNewText] = useState(text)

    useEffect(() => {
        if (text.length > limit) {
             setNewText(text.substring(0, limit) + "...")
          } else {
            return newText
          }
    }, [])

    return <Tooltip title={text}>
        <i style={{cursor: 'pointer'}}>{newText}</i>
    </Tooltip>
}

export default SimpleTextReducer
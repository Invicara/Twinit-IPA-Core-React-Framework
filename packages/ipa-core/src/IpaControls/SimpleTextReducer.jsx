import React, {useState, useEffect} from "react"
import { Tooltip } from "@material-ui/core"

const SimpleTextReducer = ({text, limit}) => { 
    const [newText, setNewText] = useState(text)
    const [underLimit, setUnderLimit] = useState(false)

    useEffect(() => {
        if (text.length > limit) {
             setNewText(text.substring(0, limit) + "...")
          } else {
            setUnderLimit(true)
            return newText
          }
    }, [])

    return (
        <div>
            {underLimit ? <i>{newText}</i> : 
            <Tooltip title={text}>
                <i style={{cursor: 'pointer'}}>{newText}</i>
            </Tooltip>}
        </div>
)}

export default SimpleTextReducer
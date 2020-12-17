import React, {useEffect, useState} from "react";
import clsx from "clsx";

export const Overlay  = ({children, config: {show, duration, onFadeOut, content, noFade}}) => {
    const [durationElapsed, setDurationElapsed] = useState(false);

    useEffect(() => {
        setDurationElapsed(false)
        if(duration) {
            setTimeout(() => {
                setDurationElapsed(true)
                onFadeOut()
            }, duration)
        }
    }, [show, duration, onFadeOut])

    return <div className={clsx('overlay',!noFade && 'fade', show && !durationElapsed && 'shown')} >
        {content || children}
    </div>
}

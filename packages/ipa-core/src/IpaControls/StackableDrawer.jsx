import React, {useCallback, useEffect, useRef, useState} from "react";
import clsx from "clsx";
import interact from "interactjs";

import './StackableDrawer.scss'

const toggleHeight = 50;
const DEFAULT_DRAWER_WIDTH = 360;

export const StackableDrawer = ({level = 1, iconKey, children, defaultOpen=true, onOpen=()=>{}, onClose=()=>{}, isDrawerOpen=true, fixedWidth=0, tooltip}) => {
  const [stableWidth, setStableWidth] = useState(defaultOpen ? DEFAULT_DRAWER_WIDTH : 0)
  const drawer = useRef();
  const toggleOpen = useCallback(() => {
    if(stableWidth === 0) onOpen()
    else onClose()
    setStableWidth(stableWidth => stableWidth === 0 ? fixedWidth != 0 ? fixedWidth : DEFAULT_DRAWER_WIDTH : 0)
  }, [stableWidth])

  useEffect(() => {
    if(isDrawerOpen)setStableWidth(fixedWidth != 0 ? fixedWidth : DEFAULT_DRAWER_WIDTH)
    else setStableWidth(0)
  }, [isDrawerOpen])

  useEffect(() => {
    interact(drawer.current).resizable({
      edges: { left: false, right: true, bottom: false, top: false },
      listeners: {
        move (event) {
          let target = event.target;
          event.target.style['min-width'] = `${event.rect.width}px`
        },
        start(event){
          event.target.style['transition'] = 'none'
        },
        end(event){
          event.target.style['transition'] = 'width 1s, min-width 1s';
          setStableWidth(event.target.offsetWidth)
        }
      },
    })
  }, [drawer.current])

  const open = stableWidth !== 0;

  return <div ref={drawer} className={'drawer'} style={{width: stableWidth, minWidth: stableWidth}} >
    {iconKey && <div style={{top: `${20 + toggleHeight * (level - 1)}px`}}
         className={clsx({'drawer-toggle': true, 'drawer-toggle-open': open})} onClick={toggleOpen}>
           {tooltip ? <div className="dbm-tooltip">
              <i className={`fas ${iconKey}`}/>
                <span className="dbm-tooltiptext">{tooltip}</span>
            </div> : <i className={`fas ${iconKey}`}/>}
    </div>}
    <div className={clsx({'drawer-content': true, 'drawer-content-open': open})}>{children}</div>
  </div>
}
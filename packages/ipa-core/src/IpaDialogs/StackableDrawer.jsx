import React, {useCallback, useEffect, useRef, useState} from "react";
import clsx from "clsx";
import interact from "interactjs";

import './StackableDrawer.scss'

const toggleHeight = 50;
export const DEFAULT_DRAWER_WIDTH = 360;

export const StackableDrawer = ({level = 1, iconKey, children, onOpen=_.noop, onClose=_.noop, isDrawerOpen=true,reopenKey, fixedWidth=0, tooltip, anchor = 'left',childrenMinWidth}) => {
  const [stableWidth, setStableWidth] = useState(isDrawerOpen ? DEFAULT_DRAWER_WIDTH : 0)
  const [contentMinWidth] = useState(childrenMinWidth || stableWidth)
  const drawer = useRef();
  const toggleOpen = useCallback(() => {
    if(stableWidth === 0) onOpen()
    else onClose()
    setStableWidth(stableWidth => stableWidth === 0 ? fixedWidth != 0 ? fixedWidth : DEFAULT_DRAWER_WIDTH : 0)
  }, [stableWidth])

  useEffect(() => {
    if(isDrawerOpen)setStableWidth(fixedWidth != 0 ? fixedWidth : DEFAULT_DRAWER_WIDTH)
    else setStableWidth(0)
  }, [isDrawerOpen,reopenKey])

  useEffect(() => {
    interact(drawer.current).resizable({
      edges: { left: anchor=='right', right: anchor=='left', bottom: false, top: false },
      listeners: {
        move (event) {
          let target = event.target;
          event.target.style['width'] = `${event.rect.width}px`;//this line allows the drawer to be minimized manually
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
  }, [drawer.current, anchor])

  const open = stableWidth !== 0;

  return <div ref={drawer} className={clsx('drawer',anchor=='right' && 'drawer-anchor-right')} style={{width: stableWidth}} >
    {iconKey && <div style={{top: `${20 + toggleHeight * (level - 1)}px`}}
                     className={clsx({'drawer-toggle': true, 'drawer-toggle-open': open})} onClick={toggleOpen}>
      {tooltip ? <div className="dbm-tooltip">
        <i className={clsx('fas',open && anchor=='right' ? "fa-arrow-right" : iconKey)}/>
        <span className="dbm-tooltiptext">{tooltip}</span>
      </div> : <i className={`fas ${iconKey}`}/>}
    </div>}
    <div className={clsx({'drawer-content': true, 'drawer-content-open': open})}>
      <div style={{minWidth: contentMinWidth, transitionDelay: '1s'}}>{children}</div>
    </div>
  </div>
}
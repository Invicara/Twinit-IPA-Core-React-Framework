import React, {useCallback, useEffect, useRef, useState} from "react";
import clsx from "clsx";
import './StackableDrawer.scss'
import {DEFAULT_DRAWER_WIDTH} from "./StackableDrawer";


export const StackableContentDrawer = ({children, anchor, childrenMinWidth}) => {
  const [contentMinWidth] = useState(childrenMinWidth || DEFAULT_DRAWER_WIDTH);
  const drawer = useRef();

  return <div ref={drawer} className={clsx('drawer',anchor=='right' && 'drawer-anchor-right')} style={{width: '100%',flexGrow: 1}} >
    <div className={clsx({'drawer-content': true, 'drawer-content-open': true})}>
      <div style={{minWidth: contentMinWidth, transitionDelay: '1s'}}>{children}</div>
    </div>
  </div>
}
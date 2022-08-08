import React, {useCallback, useEffect, useRef, useState} from "react";
import './StackableDrawerContainer.scss'
import clsx from "clsx";

const StackableDrawerContainer = ({children, fullWidth, anchor}) => {
  return <div className={clsx("stackable-drawers-container", fullWidth && "stackable-drawers-container-fw",anchor && "stackable-drawers-container-a-"+anchor)}>{children}</div>
}

export default StackableDrawerContainer;
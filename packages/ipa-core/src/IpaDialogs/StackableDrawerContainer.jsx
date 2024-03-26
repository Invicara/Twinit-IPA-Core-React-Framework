import React from "react";
import './StackableDrawerContainer.scss'
import clsx from "clsx";

const StackableDrawerContainer = ({children, fullWidth, anchor, customClass}) => {
  return <div className={clsx("stackable-drawers-container", fullWidth && "stackable-drawers-container-fw",anchor && "stackable-drawers-container-a-"+anchor, customClass)}>{children}</div>
}
export default StackableDrawerContainer;
import React, {useContext} from 'react';
import {OverlayContext} from './ifefOverlayContextProvider'
import classnames from "classnames";


// Main Overlay Panel container; a peer to Side Panel Container except no "snapper" junk!
// jl 10/20/2019

/*  The simplest form in a functional component; unfortunately, this needs some hooks.*/

const IfefOverlayPanelContainer  = ({children}) =>
{
  let overlayCtx = useContext(OverlayContext)

  let classes = classnames(
    'overlay-container',
    'pane',
    (overlayCtx.overlayOps.hasShownViews() || overlayCtx.overlayOps.hasShownPanels())
      ? 'enable-pointer-events'
      : 'disable-pointer-events'
  );

  return (
      <div className={classes}>
        {children}
      </div>
    );

};

export default IfefOverlayPanelContainer;



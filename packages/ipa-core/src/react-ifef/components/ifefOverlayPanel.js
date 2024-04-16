import React, {useContext} from 'react';
import classnames from "classnames";
import {CSSTransition} from 'react-transition-group';
import {OverlayContext} from './ifefOverlayContextProvider';

const IfefOverlayPanel  = ({children, side, customClasses}) =>
{
  // Use the (new) Hooks interface for Context.
  let overlayCtx = useContext(OverlayContext);

  let sideClass = 'overlay-panel-' + side;

  let classes = classnames(
    'overlay-panel',
    sideClass,
    customClasses
  );

  //let panelSize = overlayCtx.overlayOps.getPanelSize(side) || "265px";
  //let panelStyle = (side === "left" || side === "right") ? {width: panelSize} : {height: panelSize};

  return (
    <CSSTransition
      timeout={500}
      in={overlayCtx.overlayOps.isOverlayPanelShown(side)}
      classNames="overlay-panel"
    >
      <div className={classes}>
        {children}
      </div>
    </CSSTransition>

    );
};

export default IfefOverlayPanel;
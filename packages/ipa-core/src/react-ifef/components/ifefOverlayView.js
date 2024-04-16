import React, {useContext} from 'react';
import classnames from "classnames";
import {CSSTransition} from 'react-transition-group';
import {OverlayContext} from './ifefOverlayContextProvider';

const IfefOverlayView  = ({children, offdir, customClasses}) =>
{
  // Use the (new) Hooks interface for Context.
  let overlayCtx = useContext(OverlayContext);

  let offdirClass = 'overlay-view-' + offdir;

  let classes = classnames(
    'overlay-view',
    offdirClass,
    customClasses
  );

  // This will fire before the view is shown, but it is normally done to update Panel content
  let showing = overlayCtx.overlayOps.isOverlayViewShown(offdir);

  return (
    <CSSTransition
      timeout={500}
      in={showing}
      classNames="overlay-view"
    >
      <div className={classes}>
        {children}
      </div>
    </CSSTransition>

    );
};

export default IfefOverlayView;
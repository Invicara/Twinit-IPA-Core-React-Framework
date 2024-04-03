/**
 * ****************************************************************************
 *
 * INVICARA INC CONFIDENTIAL __________________
 *
 * Copyright (C) [2012] - [2018] INVICARA INC, INVICARA Pte Ltd, INVICARA INDIA
 * PVT LTD All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains the property of
 * Invicara Inc and its suppliers, if any. The intellectual and technical
 * concepts contained herein are proprietary to Invicara Inc and its suppliers
 * and may be covered by U.S. and Foreign Patents, patents in process, and are
 * protected by trade secret or copyright law. Dissemination of this information
 * or reproduction of this material is strictly forbidden unless prior written
 * permission is obtained from Invicara Inc.
 */

import React from 'react';

export const OverlayContext = React.createContext();

export const withOverlayContext = (Component) =>
  (props) =>
    (<OverlayContext.Consumer>
      {
        (contextProps) =>
          <Component {...props} {...contextProps}/>
      }
    </OverlayContext.Consumer>);

export class OverlayContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      overlayCtx: {},
      shownViews: [],
      shownPanels: [],
      panelSizes: {},
      overlayOps:{
        showOverlayView: this.showOverlayView.bind(this),
        hideOverlayView: this.hideOverlayView.bind(this),
        isOverlayViewShown: this.isOverlayViewShown.bind(this),
        hasShownViews: this.hasShownViews.bind(this),

        showOverlayPanel: this.showOverlayPanel.bind(this),
        hideOverlayPanel: this.hideOverlayPanel.bind(this),
        isOverlayPanelShown: this.isOverlayPanelShown.bind(this),
        hasShownPanels: this.hasShownPanels.bind(this),

        setPanelSize: this.setPanelSize.bind(this),
        getPanelSize: this.getPanelSize.bind(this)
      }
    };
  }

  setOverlayContext(newContext) {
    const {overlayCtx} = this.state;
    let newState = Object.assign(overlayCtx, newContext);
    this.setState({overlayCtx: newState});
  }


  showOverlayView(view) {
    let {shownViews} = this.state,
      idx = shownViews.indexOf(view);
    if (idx < 0) {
      shownViews.push(view);
      this.setState({shownViews: shownViews});
    }
  }

  hideOverlayView(view) {
    let {shownViews} = this.state,
         idx = shownViews.indexOf(view);
    if (idx > -1) {
      shownViews.splice(idx);
      this.setState({shownViews: shownViews});
    }
  }

  isOverlayViewShown(view) {
    return (this.state.shownViews.indexOf(view) > -1);
  }

  hasShownViews() {
    return (this.state.shownViews.length > 0);
  }

  showOverlayPanel(side) {
    let {shownPanels} = this.state,
      idx = shownPanels.indexOf(side);
    if (idx < 0) {
      shownPanels.push(side);
      this.setState({shownPanels: shownPanels});
    }
  }

  hideOverlayPanel(side) {
    let {shownPanels} = this.state,
      idx = shownPanels.indexOf(side);
    if (idx > -1) {
      shownPanels.splice(idx, 1);
      this.setState({shownPanels: shownPanels});
    }
  }

  isOverlayPanelShown(side) {
    return (this.state.shownPanels.indexOf(side) > -1);
  }

  hasShownPanels() {
    return (this.state.shownPanels.length > 0);
  }

  setPanelSize(side, size) {
    let {panelSizes} = this.state;
    panelSizes[side] = size;
    this.setState({panelSizes: panelSizes})
  }

  getPanelSize(side) {
    return this.state.panelSizes[side];
  }

  render() {
    return <OverlayContext.Provider value={this.state}>{this.props.children}</OverlayContext.Provider>
  }
}

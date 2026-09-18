import * as PropTypes from 'prop-types';
import React from 'react';
import FlexContainer from './FlexContainer';
import FlexContent from './FlexContent';
import FlexLeftNav from './FlexLeftNav';
import FlexLeftNavs from './FlexLeftNavs';
import SidePanelContainer from './SidePanelContainer';
import BottomPanel from './BottomPanel';
import Item from '../IpaControls/Item';

import TitleBar from './TitleBar';
import getInternalChrome, { internalChromeNames } from './InternalChrome';

import _ from 'lodash';
import classNames from 'classnames';

import './Layout-grouped-left-nav-bar.scss';
import './Layout-MainNav.scss';
import './Layout.scss';
import clsx from 'clsx';
import { connect } from 'react-redux';
import { AppContext } from '../appContext';

class Layout extends React.Component {
  static contextType = AppContext;
  constructor(props) {
    super(props);
    this.state = {
      bottomPanelHeight: props.contextProps.bottomPanelHeight,
    };
  }

  _mouseDown(e) {
    this.beginDrag = e.screenY;
    this.originalHeight = this.state.bottomPanelHeight;
  }

  _mouseUp() {
    this.beginDrag = undefined;
  }

  _mouseMove(e) {
    if (this.beginDrag) {
      let delta = this.beginDrag - e.screenY;
      if (
        this.originalHeight + delta <= window.innerHeight - 80 &&
        this.originalHeight + delta >= 80
      )
        this.setState({ bottomPanelHeight: this.originalHeight + delta });
    }
  }

  _fullScreen() {
    this.setState({ bottomPanelHeight: window.innerHeight - 80 });
  }

  _defaultScreen() {
    this.setState({ bottomPanelHeight: this.props.contextProps.defaultBottomPanelHeight });
  }

  _getIcon(icon, customClass) {
    let iconClass = icon;
    iconClass += icon.startsWith('icofont') ? ' icofont-2x' : '';
    iconClass += customClass ? ' ' + customClass : '';
    return <i className={iconClass} />;
  }

  isActivePage(path) {
    let loc = window.location.hash && window.location.hash.substr(1);
    loc = loc.split('?')[0];

    let pageRegex = new RegExp(path + '(?:/|$)');
    return pageRegex.test(loc);
  }

  getNavItem(page, activeClass, iconClass) {
    if (page.dontindex) return null;
    let loc = window.location.hash && window.location.hash.substr(1);
    loc = loc.split('?')[0];

    let pageRegex = new RegExp(page.path + '(?:/|$)');
    return (
      <li
        className={clsx('nav-li', pageRegex.test(loc) ? activeClass : '')}
        key={page.path ? page.path : page.key}
      >
        <Item
          page={page}
          link={page.path}
          key={page.path ? page.path : page.key}
          customClasses={page.customClasses}
          onClick={page.onClick}
          item={false}
        >
          {this._getIcon(page.icon, iconClass)}
          <span className="menu-item"> {page.title}</span>
        </Item>
      </li>
    );
  }

  getGroupedNavItem(group) {
    const isActiveGroup = group.items.some(p => this.isActivePage(p.path));
    let items = group.items.map(p => this.getNavItem(p, 'active-page', 'purple active'));

    const groupClasses = classNames({
      'nav-group-li': true,
      'active-group': isActiveGroup,
    });

    return (
      <li className={groupClasses} key={group.groupName}>
        <Item item={false}>
          {this._getIcon(group.icon, isActiveGroup ? 'purple active' : undefined)}
        </Item>
        <FlexLeftNav customClasses="grouped-nav">
          <div className={'group-header'}>
            {this._getIcon(group.icon, 'purple active')}
            <div className={'group-name'}>{group.groupName}</div>
          </div>
          <ul>{items}</ul>
        </FlexLeftNav>
      </li>
    );
  }

  getComponent(name) {
    let component;
    try {
      component = require('../../../../app/ipaCore/' + name + '.jsx').default;
    } catch (e) {
      // Not a file in the application, so try what this framework ships. That
      // is what lets a userConfig name AppSidebar without the application
      // declaring a component for it. The application is tried first, so it can
      // shadow the name with a file of its own.
      component = getInternalChrome(name);
      if (!component) {
        console.error(e);
        console.error(
          `can't find component ${name} in app/ipaCore, and it is not one of ` +
            `the components ipa-core ships (${internalChromeNames.join(', ')})`
        );
        component = null;
      }
    }

    return component;
  }

  render() {
    let contextProps = this.props.contextProps;

    let items =
      this.props.pageGroups.length > 0
        ? this.props.pageGroups.map(g => this.getGroupedNavItem(g))
        : this.props.pageList.map(p => this.getNavItem(p, 'main-nav-active'));

    let sidePanelSettings = {
      tapToClose: false,
      elementBottomDimension: this.state.bottomPanelHeight,
    };
    const bottomPanelToolbar = (
      <div style={{ padding: '5px' }}>
        <div className="model-viewer-toolbar">
          <div className="model-viewer-default-size" onClick={this._defaultScreen.bind(this)}>
            <i className="fas fa-window-minimize"></i>
          </div>
          <div className="model-viewer-full-screen" onClick={this._fullScreen.bind(this)}>
            <i className="fas fa-window-maximize"></i>
          </div>
          <div className="model-viewer-splitter" onMouseDown={this._mouseDown.bind(this)}>
            <i className="fas fa-arrows-alt-v"></i>
          </div>
          <div className="model-viewer-close" onClick={contextProps.actions.toggleBottomPanel} />
        </div>
      </div>
    );

    let showTitle = true;
    let showSidebar = true;
    let settings = this.props.contextProps.userConfig.settings;
    let cn = '';
    if (settings && settings.noSideBar === true) {
      cn += ' no-sidebar';
      showSidebar = false;
    }
    if (settings && settings.noTitleBar === true) {
      cn += ' no-titlebar';
      showTitle = false;
    }

    let customSidebar;
    if (settings.sidebarComponent) {
      customSidebar = { component: this.getComponent(settings.sidebarComponent) };
    }

    return (
      <div
        className={cn}
        onMouseMove={this._mouseMove.bind(this)}
        onMouseUp={this._mouseUp.bind(this)}
      >
        {showTitle && (
          <TitleBar
            contextProps={this.props.contextProps}
            parent={this}
            ipaConfig={this.props.ipaConfig}
          />
        )}
        <SidePanelContainer settings={sidePanelSettings} {...this.props}>
          <FlexContainer {...this.props}>
            {customSidebar?.component ? (
              /* The framework's own navigation arrives through React.lazy, so
                 it needs a boundary. One from the application is not lazy and
                 passes straight through. */
              <React.Suspense fallback={null}>
                <customSidebar.component {...this.props.contextProps} />
              </React.Suspense>
            ) : (
              showSidebar && (
                <FlexLeftNavs
                  customClasses={this.props.pageGroups.length > 0 ? 'grouped-left-nav-bar' : ''}
                >
                  <FlexLeftNav customClasses="main-nav">
                    <ul>{items}</ul>
                  </FlexLeftNav>
                </FlexLeftNavs>
              )
            )}
            <FlexContent
              {...this.props}
              location={this.context.location}
              customClasses="has-left-nav"
            >
              {this.props.children}
              <BottomPanel height={this.state.bottomPanelHeight} hideOnLoad={true}>
                {bottomPanelToolbar}
                {this.props.bottomPanelContent ? (
                  <this.props.bottomPanelContent contextProps={contextProps} />
                ) : (
                  ''
                )}
              </BottomPanel>
            </FlexContent>
          </FlexContainer>
        </SidePanelContainer>
      </div>
    );
  }
}

export default connect()(Layout);

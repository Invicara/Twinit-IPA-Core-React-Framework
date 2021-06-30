import React from 'react';
import {HashRouter, Switch} from 'react-router-dom';
import {CSSTransition, TransitionGroup} from 'react-transition-group';


import AppProvider, {AppContext} from "../AppProvider";

import {LocalFilePlugins} from '@invicara/script-ui';
import {DataPlugins} from '@invicara/script-data';
import {IafPlugins} from '@invicara/script-iaf';

import store from "../redux/store";
import {Provider} from "react-redux";
import {enableMapSet} from "immer"
import { IfefBody } from '@invicara/react-ifef';
import { getPlatform } from '../IpaUtils/helpers';
import * as qs from 'query-string';

import ScriptHelper from "../IpaUtils/ScriptHelper";
import Layout from './Layout';

import SisenseLoginPage from '../IpaPageComponents/sisense/SisenseLoginPage'
import SisenseLogoutPage from '../IpaPageComponents/sisense/SisenseLogoutPage'

import '../IpaStyles/theme.scss'
import '../IpaIcons/icons.scss'


enableMapSet()

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {platformOverride: this.props.location.search ?
                        qs.parse(this.props.location.search).platformOverride : 
                        ""};
  }


  UNSAFE_componentWillReceiveProps(newProps) {
    var newPlatformOverride = newProps.location.search ? 
                              qs.parse(newProps.location.search).platformOverride :
                              "";
    if (newPlatformOverride) {
      if (newPlatformOverride !== this.state.platformOverride) {
        this.setState({platformOverride: newPlatformOverride});
      }
    }
  }

  render() {
    var platform = getPlatform(this.state.platformOverride);

    return (
      <IfefBody platform={platform} history={this.props.history} location={this.props.location}>
        {this.props.children}
      </IfefBody>
    );
  }
}

class IpaMainLayout extends React.Component {
    constructor(props) {
        super(props);
        IafPlugins.BAM_Script.initBAMScriptPlugins();
        LocalFilePlugins.initScriptPlugins();
        DataPlugins.initScriptPlugins();
        ScriptHelper.initExpressionExecCtx();   // sets up an ExpressionExecCtx in ScriptHelper (browser here)
    }

    render() {

      //const hashRouterPath = _.get(this, "props.location.hash");
      const hashRouterPath = window.location.hash
      console.log('hash', hashRouterPath)
      if(hashRouterPath.indexOf('#/sisense-login') === 0) {
        console.log('Redirect to sisense login router.');
        return <SisenseLoginPage {...this.props}/>;
      } else if(hashRouterPath.indexOf('#/sisense-logout') === 0) {
        console.log('Redirect to sisense logout router.');
        return <SisenseLogoutPage {...this.props}/>;
      } else

        return (
            <div>
              <link rel='stylesheet' type='text/css' href='./node_modules/bootstrap/dist/css/bootstrap.min.css'></link>
              <Provider store={store}>
                <HashRouter>
                    <App history={history} location={location}>
                        <AppProvider location={location} history={history} ipaConfig={this.props.ipaConfig} onConfigLoad={this.props.onConfigLoad}> 
                            <AppContext.Consumer>
                                {
                                    (contextProps) => contextProps.isLoading ?
                                        <div>{contextProps.loadingText}</div>
                                        :
                                        <Layout pageList={contextProps.router.pageList}
                                                pageGroups={contextProps.router.pageGroups}
                                                userLogout={contextProps.actions.userLogout}
                                                contextProps={contextProps}
                                                bottomPanelContent={this.props.bottomPanelContent}
                                                ipaConfig={this.props.ipaConfig}>

                                            <TransitionGroup>
                                                <CSSTransition key={location.pathname}
                                                               timeout={500} classNames="nav-view"
                                                               onEnter={this.transitionEnter}>
                                                    <Switch>
                                                        {contextProps.router.pageRoutes}
                                                    </Switch>
                                                </CSSTransition>
                                            </TransitionGroup>

                                        </Layout>
                                }
                            </AppContext.Consumer>
                        </AppProvider>
                    </App>
                </HashRouter>
            </Provider>
          </div>
        )
    }
}

export default IpaMainLayout
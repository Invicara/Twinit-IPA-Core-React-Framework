import React from 'react';
import {HashRouter, Switch} from 'react-router-dom';
import {CSSTransition, TransitionGroup} from 'react-transition-group';


import AppProvider from "../AppProvider";
import {AppContext} from "../appContext";

import {LocalFilePlugins} from '@invicara/script-ui';
import {DataPlugins} from '@invicara/script-data';
import {IafPlugins} from '@invicara/script-iaf';

import store from "../redux/store";
import {Provider} from "react-redux";
import {enableMapSet} from "immer"
import IfefBody from '../react-ifef/components/ifefBody';
import { getPlatform } from '../IpaUtils/helpers';
import * as qs from 'querystring';

import ScriptHelper from "../IpaUtils/ScriptHelper";
import Layout from './Layout';

import '../IpaStyles/theme.scss'
import '../IpaIcons/icons.scss'

import {IafAuth} from '@invicara/platform-ui-components';
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles';

const {AuthProvider, AuthService} = IafAuth;

const generateClassName = createGenerateClassName({
  productionPrefix: 'ipa-',
});

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
        ScriptHelper.initExpressionExecCtx(); // bringing back this cause the page was not loading
        this.authService = new AuthService({        //Added authService for rotated refresh token
          clientId: endPointConfig.appId || this.props.ipaConfig?.applicationId,
          location: window.location,
          //provider: process.env.REACT_APP_PROVIDER || 'provider',
          redirectUri: endPointConfig.baseRoot,
          scopes: ["read write"],
          tokenEndpoint:
            `${endPointConfig.passportServiceOrigin}/passportsvc/api/v1/oauth/token`,
          authorizeEndpoint:
            `${endPointConfig.passportServiceOrigin}/passportsvc/api/v1/oauth/authorize`,
          authType: endPointConfig.authType, // Tells about which authentication process/type we're using. It can be "implicit" or "pkce".
        });
    }

    render() {

        return (
            <div>
              <Provider store={store}>
                <HashRouter>
                    <App history={history} location={location}>
                    <AuthProvider authService={this.authService}>
                        <AppProvider location={location} history={history} ipaConfig={this.props.ipaConfig} onConfigLoad={this.props.onConfigLoad}> 
                            <AppContext.Consumer>
                                {
                                    (contextProps) => {
                                      console.log("AppContext contextProps", contextProps)
                                      return contextProps.isLoading ?
                                        <div>{contextProps.loadingText}</div>
                                        :
                                       <StylesProvider generateClassName={generateClassName}> 
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
                                       </StylesProvider>
                                    }
                              }
                            </AppContext.Consumer>
                        </AppProvider>
                        </AuthProvider>
                    </App>
                </HashRouter>
            </Provider>
          </div>
        )
    }
}

export default IpaMainLayout
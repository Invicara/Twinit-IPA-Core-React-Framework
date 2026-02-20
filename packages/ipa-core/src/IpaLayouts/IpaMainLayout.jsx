import React from 'react';
import { connect } from 'react-redux';
import {HashRouter, Switch} from 'react-router-dom';
import {CSSTransition, TransitionGroup} from 'react-transition-group';


import AppProvider from "../AppProvider";
import {AppContext} from "../appContext";

import store from "../redux/store";
import {Provider} from "react-redux";
import {enableMapSet} from "immer"
import IfefBody from '../react-ifef/components/ifefBody';
import { getPlatform } from '../IpaUtils/helpers';
import * as qs from 'querystring';

import Layout from './Layout';
import LoadingModal from '../IpaDialogs/LoadingModal';

import '../IpaStyles/theme.scss'
import '../IpaIcons/icons.scss'

import {IafAuth} from '@dtplatform/platform-ui-components';
import StylesProvider from '@mui/styles/StylesProvider';
import createGenerateClassName from '@mui/styles/createGenerateClassName';

import { createTheme, ThemeProvider } from '@mui/material/styles';

const {AuthProvider, AuthService} = IafAuth;

const generateClassName = createGenerateClassName({
  productionPrefix: 'ipa-',
});

enableMapSet()

function LoadingScreenWithModal({ modal }) {
  const showLoadingModal = !modal?.open || !modal?.component;
  return (
    <div className="ipa-loading-screen">
      <header className="ipa-loading-screen__header">
        <img src="/fonts/twinit.svg" alt="" className="ipa-loading-screen__logo" />
      </header>
      <div className="ipa-loading-screen__body">
        {showLoadingModal && (
          <LoadingModal
            title="Signing you in"
            description="We’re checking your details. This will only take a moment..."
            hideOverlay={true}
          />
        )}
      </div>
    </div>
  );
}

const LoadingScreenWithModalConnected = connect(state => ({ modal: state.modal }))(LoadingScreenWithModal);

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

    const theme = createTheme({
      palette: {
        buttonDefault: {
          main: '#E0E0E0'
        },
        tabDefault: {
          main: '#000000DE'
        },
      },
    });

    return (
      <ThemeProvider theme={theme}> 
        <IfefBody platform={platform} history={this.props.history} location={this.props.location}>
          {this.props.children}
        </IfefBody>
      </ThemeProvider> 
    );
  }
}

class IpaMainLayout extends React.Component {
    constructor(props) {
        super(props);
        // IafPlugins.BAM_Script.initBAMScriptPlugins();
        // LocalFilePlugins.initScriptPlugins();
        // DataPlugins.initScriptPlugins();
        this.authService = new AuthService({        //Added authService for rotated refresh token
          clientId: endPointConfig.appId || this.props.ipaConfig?.applicationId,
          location: window.location,
          redirectUri: endPointConfig.baseRoot,
          scopes: ["read write"],
          tokenEndpoint:
            `${endPointConfig.passportServiceOrigin}/passportsvc/api/v1/oauth/token`,
          authorizeEndpoint:
            `${endPointConfig.passportServiceOrigin}/passportsvc/api/v1/oauth/authorize`,
          authType: endPointConfig.authType, // Tells about which authentication process/type we're using. It can be "implicit" or "pkce".
        });
        this.authService.initialize();

    }

    render() {

        return (
            <div data-theme="invicara">
              <div id="ipa-ui-modal-root" />
              <Provider store={store}>
                <HashRouter>
                    <App history={history} location={location}>
                    <AuthProvider authService={this.authService}>
                        <AppProvider 
                          location={location} 
                          history={history} 
                          ipaConfig={this.props.ipaConfig} 
                          onConfigLoad={this.props.onConfigLoad} 
                          onCancel={this.props.onCancel} //I don't think this is used by any app yet we should think about removing it
                          projectLoadHandlerCallback={this.props.projectLoadHandlerCallback}
                          onProjectPickerCancel={this.props.onProjectPickerCancel}
                        > 
                            <AppContext.Consumer>
                                {
                                    (contextProps) => {
                                      console.log("AppContext contextProps", contextProps)
                                      return contextProps.isLoading ? (
                                        <LoadingScreenWithModalConnected />
                                      ) : (
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
                                      );
                                    }
                              }
                            </AppContext.Consumer>
                        </AppProvider>
                        </AuthProvider>
                    </App>
                </HashRouter>
            </Provider>
          </div>
        );
    }
}

export default IpaMainLayout
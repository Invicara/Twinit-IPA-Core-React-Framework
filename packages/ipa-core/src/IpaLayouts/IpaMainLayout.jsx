import React from 'react';
import { connect } from 'react-redux';
import { HashRouter, Switch } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import AppProvider from '../AppProvider';
import { AppContext } from '../appContext';

import store from '../redux/store';
import { Provider } from 'react-redux';
import { enableMapSet } from 'immer';
import IfefBody from '../react-ifef/components/ifefBody';
import { getPlatform } from '../IpaUtils/helpers';
// qs rather than node's querystring: this is a browser bundle, and the
// builtin forces every consumer to polyfill it. ignoreQueryPrefix strips
// the leading '?' of location.search, which querystring.parse did not.
import qs from 'qs';

import Layout from './Layout';
import Logo from './Logo';
import LoadingModal from '../IpaDialogs/LoadingModal';

import '../IpaStyles/theme.scss';
import '../IpaIcons/icons.scss';

import { IafAuth } from '@dtplatform/platform-ui-components';
import StylesProvider from '@mui/styles/StylesProvider';
import createGenerateClassName from '@mui/styles/createGenerateClassName';

import { createTheme, ThemeProvider } from '@mui/material/styles';

const { AuthProvider, AuthService } = IafAuth;

const generateClassName = createGenerateClassName({
  productionPrefix: 'ipa-',
});

enableMapSet();

function LoadingScreenWithModal({ modal, ipaConfig }) {
  const showLoadingModal = !modal?.open || !modal?.component;
  return (
    <div className="ipa-loading-screen">
      {ipaConfig?.appImage && (
        <header className="ipa-loading-screen__header">
          <img src={ipaConfig?.appImage} alt="" className="ipa-loading-screen__logo" />
        </header>
      )}
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

const LoadingScreenWithModalConnected = connect(state => ({ modal: state.modal }))(
  LoadingScreenWithModal
);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      platformOverride: this.props.location.search
        ? qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).platformOverride
        : '',
    };
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    let newPlatformOverride = newProps.location.search
      ? qs.parse(newProps.location.search, { ignoreQueryPrefix: true }).platformOverride
      : '';
    if (newPlatformOverride) {
      if (newPlatformOverride !== this.state.platformOverride) {
        this.setState({ platformOverride: newPlatformOverride });
      }
    }
  }

  render() {
    let platform = getPlatform(this.state.platformOverride);

    const theme = createTheme({
      palette: {
        buttonDefault: {
          main: '#E0E0E0',
        },
        tabDefault: {
          main: '#000000DE',
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
    this.authService = new AuthService({
      //Added authService for rotated refresh token
      clientId: endPointConfig.appId || this.props.ipaConfig?.applicationId,
      location: window.location,
      scopes: ['read write'],

      /** Background
       * Since Twinit Platform v5.2 when creating new applications, "implicit" grant type is no longer set by default.
       * In an application item, it has a property "authorizedGrantTypes" which is an array of grant types.
       * Pre 5.2 would look like ["implicit", "authorization_code", "refresh_token"]
       * Post 5.2 would look like ["authorization_code", "refresh_token"]
       *
       * authorization_code = pkce
       */

      /** NOTE: If using V2 endpoints, the redirectUri CANNOT have a trailing slash ("/") or login will error and fail!
       * So something to consider and whether each individual app needs to be updated. Or can be handled here instead.
       */
      redirectUri: endPointConfig.baseRoot,

      /** V2 endpoints
       * This explicitly sets the v2 tokenEndpoint, authorizeEndpoint endpoints, authType=pkce and pkceVersion=v5
       */
      tokenEndpoint: `${endPointConfig.passportServiceOrigin}/passportsvc/api/v2/oauth/token`,
      authorizeEndpoint: `${endPointConfig.passportServiceOrigin}/passportsvc/api/v2/oauth/authorize`,
      authType: endPointConfig.authType ? endPointConfig.authType : 'pkce', // Sets which authentication process/type we're using. It can be "implicit" or "pkce".
      pkceVersion: endPointConfig.pkceVersion ? endPointConfig.pkceVersion : 'v5', // Sets which PKCE version we're using. It can be "v5" or "legacy".

      /** V2 endpoint alternative,
       * setting new "passportServiceBaseUrl" config alone implies v2 tokenEndpoint, authorizeEndpoint endpoints, authType=pkce and pkceVersion=v5
       * See https://github.com/Invicara/InvicaraAppFramework/blob/dc2e435394270e12d6ba4c7815aaa7e51f6928b2/packages/platform-ui-components/src/Iaf-Auth/AuthService.js#L12
       */
      // passportServiceBaseUrl: `${endPointConfig.passportServiceOrigin}/passportsvc/api`,

      /** If staying on v1 endpoints (not recommended as its deprecated)
       * Although consider if there are older Twinit apps that don't support pkce grant type (doesn't have "authorization_code" in authorizedGrantTypes property on application)
       */
      // tokenEndpoint: `${endPointConfig.passportServiceOrigin}/passportsvc/api/v1/oauth/token`,
      // authorizeEndpoint: `${endPointConfig.passportServiceOrigin}/passportsvc/api/v1/oauth/authorize`,
      // authType: endPointConfig.authType ? endPointConfig.authType : 'pkce',
      // pkceVersion: endPointConfig.pkceVersion ? endPointConfig.pkceVersion : 'legacy'
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
                  pageComponentLoader={this.props.pageComponentLoader}
                >
                  <AppContext.Consumer>
                    {contextProps => {
                      console.log('AppContext contextProps', contextProps);
                      return contextProps.isLoading ? (
                        <LoadingScreenWithModalConnected ipaConfig={this.props.ipaConfig} />
                      ) : (
                        <StylesProvider generateClassName={generateClassName}>
                          <Layout
                            pageList={contextProps.router.pageList}
                            pageGroups={contextProps.router.pageGroups}
                            userLogout={contextProps.actions.userLogout}
                            contextProps={contextProps}
                            bottomPanelContent={this.props.bottomPanelContent}
                            ipaConfig={this.props.ipaConfig}
                          >
                            <TransitionGroup>
                              <CSSTransition
                                key={location.pathname}
                                timeout={500}
                                classNames="nav-view"
                                onEnter={this.transitionEnter}
                              >
                                <Switch>{contextProps.router.pageRoutes}</Switch>
                              </CSSTransition>
                            </TransitionGroup>
                          </Layout>
                        </StylesProvider>
                      );
                    }}
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

export default IpaMainLayout;

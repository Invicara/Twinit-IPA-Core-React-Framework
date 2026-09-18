import React from 'react';
import HeaderBar from './HeaderBar';
import getInternalChrome, { internalChromeNames } from './InternalChrome';
import Logo from './Logo';
import { getTitleBarInfoFromProps } from '../IpaUtils/helpers';
import LinkedIcon from '../IpaControls/LinkedIcon';
import IconLogout from '../IpaIcons/icon-logout.svg';
import IconUser from '../IpaIcons/icon-user.svg';

import { getPlatformPath } from '../IpaPaths';

import './TitleBar.scss';
import '../IpaIcons/icons.scss';

export default class TitleBar extends React.Component {
  render() {
    let titleInfo = getTitleBarInfoFromProps('', this.props.contextProps);

    const switchProj = e => {
      e.preventDefault();
      titleInfo.switchProject();
    };

    const goToUserAccount = e => {
      e.preventDefault();
      window.open(getPlatformPath('USER_ACCOUNT'));
    };

    let customHeader;
    const userConfigSettings = this.props.contextProps?.userConfig?.settings;
    if (userConfigSettings.headerComponent) {
      try {
        customHeader = {
          component: require(
            '../../../../app/ipaCore/' + userConfigSettings.headerComponent + '.jsx'
          ).default,
        };
      } catch (error) {
        // Not a file in the application, so try the headers this framework
        // ships. That is what lets a userConfig name GlobalHeader without the
        // application declaring a component for it. The application is still
        // tried first, so it can shadow the name with a file of its own.
        const internal = getInternalChrome(userConfigSettings.headerComponent);
        if (internal) {
          customHeader = { component: internal };
        } else {
          console.error(
            `Header component not found at path ${userConfigSettings.headerComponent}, ` +
              `and it is not one of the components ipa-core ships ` +
              `(${internalChromeNames.join(', ')}). Using default header.`
          );
        }
      }
    }

    // If user is undefined (i.e. token has expired), we run restartApp() to generate token and to set user object
    if (!this.props.contextProps.user) {
      this.props.contextProps.actions.restartApp();
    }

    return (
      <>
        {customHeader?.component ? (
          /* The framework's own header arrives through React.lazy, so it needs
             a boundary. One from the application is not lazy and passes
             straight through. The fallback is null rather than a spinner: this
             is a 56px bar that resolves in one tick, and anything else would
             flash. */
          <React.Suspense fallback={null}>
            <customHeader.component
              {...this.props.contextProps}
              titleInfo={titleInfo}
              switchProj={switchProj}
              goToUserAccount={goToUserAccount}
              userLogout={this.props.parent?.props?.userLogout}
              logoComponent={Logo}
            />
          </React.Suspense>
        ) : (
          <HeaderBar customClasses="always-flex titlebar-header">
            <Logo
              homepage="#/"
              appName={this.props.ipaConfig.appName}
              contextProps={this.props.contextProps}
            />
            <div id="active-session">
              <div id="active-session-text">
                <div className={'session-dropdown'}>
                  {titleInfo.projectName}
                  <i className={'icofont-rounded-down'} />
                  <div className={'session-options'}>
                    <LinkedIcon
                      customClass={'session-item'}
                      clickHandler={switchProj}
                      icon={'icofont-refresh icofont-2x'}
                      linkText={'Switch Project'}
                    />
                    <LinkedIcon
                      customClass={'session-item'}
                      clickHandler={this.props.parent.props.userLogout}
                      iconClasses={'ipa-icon-svg'}
                      iconImg={IconLogout}
                      linkText={'Logout'}
                    />
                    <LinkedIcon
                      customClass={'session-item'}
                      clickHandler={goToUserAccount}
                      iconClasses={'ipa-icon-svg'}
                      iconImg={IconUser}
                      linkText={
                        this.props.contextProps?.user?._firstname +
                        ' ' +
                        this.props.contextProps?.user?._lastname
                      }
                    />

                    <div className={'session-item'}>{version?.version}</div>
                  </div>
                </div>
              </div>
            </div>
          </HeaderBar>
        )}
      </>
    );
  }
}

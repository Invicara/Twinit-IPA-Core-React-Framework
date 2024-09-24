import React from "react"
import HeaderBar from './HeaderBar'
import Logo from './Logo';
import {getTitleBarInfoFromProps} from "../IpaUtils/helpers";
import LinkedIcon from "../IpaControls/LinkedIcon"
import IconLogout from "../IpaIcons/icon-logout.svg"
import IconUser from "../IpaIcons/icon-user.svg"

import {getPlatformPath} from '../IpaPaths'

import './TitleBar.scss'
import '../IpaIcons/icons.scss'

export default class TitleBar extends React.Component {
    render() {
        let titleInfo = getTitleBarInfoFromProps('', this.props.contextProps);

        const switchProj = (e) => {
            e.preventDefault()
            titleInfo.switchProject()
        }

        const goToUserAccount = (e) => {
            e.preventDefault()
            window.open(getPlatformPath('USER_ACCOUNT'))
        }

        let customHeader
        const userConfigSettings = this.props.contextProps?.userConfig?.settings
        if (userConfigSettings.headerComponent) {
            try {
                customHeader = { component: require('../../../../../app/ipaCore/' + userConfigSettings.headerComponent + '.jsx').default }
            } catch(error) {
                console.error(`Header component not found at path ${userConfigSettings.headerComponent}. Using default header.`)
            }
        }

        return (
            <>
                {customHeader?.component ? (
                    <customHeader.component
                        {...this.props.contextProps }
                        titleInfo={titleInfo}
                        switchProj={switchProj}
                        goToUserAccount={goToUserAccount}
                        userLogout={this.props.parent?.props?.userLogout}
                        logoComponent={Logo}
                    />
                ) : (
                    <HeaderBar customClasses="always-flex titlebar-header">
                        <Logo homepage="#/" appName={this.props.ipaConfig.appName} contextProps={this.props.contextProps}/>
                        <div id="active-session">
                            <div id="active-session-text">
                                <div className={'session-dropdown'}>
                                    {titleInfo.projectName}
                                    <i className={'icofont-rounded-down'}/>
                                    <div className={'session-options'}>         
                                        <LinkedIcon customClass={'session-item'} clickHandler={switchProj} icon={'icofont-refresh icofont-2x'} linkText={'Switch Project'}/>
                                        <LinkedIcon customClass={'session-item'} clickHandler={this.props.parent.props.userLogout} iconClasses={'ipa-icon-svg'} iconImg={IconLogout} linkText={'Logout'}/>
                                        <LinkedIcon customClass={'session-item'} clickHandler={goToUserAccount} iconClasses={'ipa-icon-svg'} iconImg={IconUser} linkText={this.props.contextProps.user._firstname + " " + this.props.contextProps.user._lastname}/>

                                        <div className={'session-item'}>{version?.version}</div>
                                    </div>
                                </div>                    
                            </div>
                        </div>
                    </HeaderBar>
                )}
            </>
        )
   }
}

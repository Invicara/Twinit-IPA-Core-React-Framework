import React from 'react';
import {IafAuth} from '@invicara/platform-ui-components';

const {useAuth} = IafAuth;

const withAuthHoc = (WrapperComponent) => {
    return (props) => {
        const {authService, authTokens} = useAuth();
        return <WrapperComponent {...props} authService={authService} authTokens={authTokens}/>
    }
}

export default withAuthHoc;
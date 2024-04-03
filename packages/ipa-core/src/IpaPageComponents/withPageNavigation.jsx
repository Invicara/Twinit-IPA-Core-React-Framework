import React from 'react';
import { withRouter } from 'react-router';
import {GenericPageContext} from "./genericPageContext";

export default function withPageNavigation(Component) {

    function WrappedComponent(props) {

        return <GenericPageContext.Consumer>
            {(genericPageContext) => <Component {...props} onNavigate={genericPageContext.onNavigate}/>}
        </GenericPageContext.Consumer>
    }

    return withRouter(WrappedComponent);
}


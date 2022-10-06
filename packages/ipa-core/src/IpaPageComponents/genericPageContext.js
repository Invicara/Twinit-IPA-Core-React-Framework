import React from "react";

export const GenericPageContext = React.createContext();

export const withGenericPageContext = (Component) => (props) => (<GenericPageContext.Consumer>
    {(genericPageContext) => <Component {...props} {...genericPageContext}/>}
</GenericPageContext.Consumer>);
import React from "react";

export const GenericPageContext = React.createContext();

export const withGenericPageContext = (Component) => (props) => (<GenericPageContext.Consumer>
    {(contextProps) => <Component {...props} {...contextProps}/>}
</GenericPageContext.Consumer>);
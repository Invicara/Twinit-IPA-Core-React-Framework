import React from "react";

export const AppContext = React.createContext();

export const withAppContext = (Component) => (props) => (<AppContext.Consumer>
    {(contextProps) => {
        //console.log("withAppContext contextProps.userConfig",{...contextProps.userConfig});
        //console.log("withAppContext props",{...props});
        //console.log("withAppContext Component",Component);
        return <Component {...props} {...contextProps}/>}
    }
</AppContext.Consumer>);
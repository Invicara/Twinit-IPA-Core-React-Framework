import React from "react";
import { RemoteComponent } from "./RemoteComponent";

const RemoteComponentWrapper = props => {
    console.log("RemoteComponentWrapper props", props)
    return <RemoteComponent {...props} url={props.url} />
};

export default RemoteComponentWrapper;
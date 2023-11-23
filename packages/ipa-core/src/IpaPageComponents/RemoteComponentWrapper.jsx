import React from "react";
import { RemoteComponent } from "@paciolan/remote-component";

const RemoteComponentWrapper = props => <RemoteComponent {...props} url={props.config.url} />;

export default RemoteComponentWrapper;
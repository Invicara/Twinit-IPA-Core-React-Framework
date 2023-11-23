import React from "react";
import { RemoteComponent } from "./RemoteComponent";

const RemoteComponentWrapper = props => <RemoteComponent {...props} url={props.config.url} />;

export default RemoteComponentWrapper;
import React from 'react';
import {AppContext} from "@invicara/ipa-core/modules/IpaUtils";

const RenderHandlerByPath = ({path}) => {
  console.log("Rendering Handler By Path: ",path);
  return <AppContext.Consumer>
    {
      (contextProps) => {
        const {pageList, pageRoutes, pageGroups} = contextProps.router;
        const routeComponent = pageRoutes.find(route=>route.key==path);
        console.log("Rendering Handler routeComponent: ",routeComponent);
        return <React.Fragment>
          {routeComponent}
        </React.Fragment>
      }
    }
  </AppContext.Consumer>;
};

export default RenderHandlerByPath;
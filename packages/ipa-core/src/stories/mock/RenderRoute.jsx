import React from 'react';
import {AppContext} from "../../appContext";

const RenderHandlerByPath = ({path}) => {
  return <AppContext.Consumer>
    {
      (contextProps) => {
        const {pageList, pageRoutes, pageGroups} = contextProps.router;
        return <React.Fragment>
          {pageRoutes.find(route=>route.key==path)}
        </React.Fragment>
      }
    }
  </AppContext.Consumer>;
};

export default RenderHandlerByPath;
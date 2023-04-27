import React from 'react';
import {AppContext} from "@invicara/ipa-core/modules/IpaUtils";

const ListRoutes = ({routeKey}) => {
  console.log("ListRoutes routeKey", routeKey);
  //
  return <AppContext.Consumer>
    {
      (contextProps) => {
        const {pageList, pageRoutes, pageGroups} = contextProps.router;
        return <React.Fragment>
          <ol>{pageList.map(page=><li>{page.title}</li>)}</ol>
          <ol>{pageRoutes.map(route=><li>{route.key}</li>)}</ol>
          {pageRoutes.map(route=>{
            const match = route.key==routeKey;
            return match ? route : null})}
        </React.Fragment>
      }
    }
  </AppContext.Consumer>;
};

export default ListRoutes;
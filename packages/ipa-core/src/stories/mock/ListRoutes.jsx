import React from 'react';
import {
  getAllCurrentEntities,
  getAppliedFilters,
  getFetchingCurrent,
  getFilteredEntities
} from "../../redux/slices/entities";
import {compose} from "@reduxjs/toolkit";
import withEntitySearch from "../../IpaPageComponents/entities/WithEntitySearch";
import withEntityAvailableGroups from "../../IpaPageComponents/entities/WithEntityAvailableGroups";
import {connect} from "react-redux";
import {MemoryRouter, Route, StaticRouter, Switch} from "react-router-dom";
import {AppContext} from "../../appContext";
import Layout from "../../IpaLayouts/Layout";
import {CSSTransition, TransitionGroup} from "react-transition-group";

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
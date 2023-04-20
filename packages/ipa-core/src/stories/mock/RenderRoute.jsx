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
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

const EntityFullViewMock = (props) => {
  return <div/>;
};

const mapStateToProps = state => ({
  allEntities: getAllCurrentEntities(state),
  fetching: getFetchingCurrent(state),
  currentEntities: getFilteredEntities(state),
  appliedFilters: getAppliedFilters(state),
});

export default compose(
    withEntitySearch,withEntityAvailableGroups,
    connect(mapStateToProps),
)(EntityFullViewMock);
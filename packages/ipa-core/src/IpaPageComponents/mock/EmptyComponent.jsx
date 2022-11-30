import React, {useEffect, useState} from 'react';
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
//import {withRouter} from "react-router-dom";

const EmptyComponent = (props) => {
  useEffect(()=>{
    props.isLoading && props.onLoadComplete && props.onLoadComplete();
  })
  console.log("EmptyComponent",props);
  return <React.Fragment></React.Fragment>;
};


export default EmptyComponent
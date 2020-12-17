import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import './FetchingLegend.scss'

export const FetchingLegend = ({legend = 'Fetching data...'}) =>
    <div className="fetching-legend"><span>{legend}</span><CircularProgress color='primary' size={25}/></div>



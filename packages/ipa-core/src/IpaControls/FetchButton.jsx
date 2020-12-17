import GenericMatButton from "./GenericMatButton";
import React from "react";

import './FetchButton.scss'

export const FetchButton = ({customClasses, ...props}) =>
    <GenericMatButton {...props} customClasses={'fetch-button ' + (customClasses || '')}/>
/**
 * ****************************************************************************
 *
 * INVICARA INC CONFIDENTIAL __________________
 *
 * Copyright (C) [2012] - [2020] INVICARA INC, INVICARA Pte Ltd, INVICARA INDIA
 * PVT LTD All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains the property of
 * Invicara Inc and its suppliers, if any. The intellectual and technical
 * concepts contained herein are proprietary to Invicara Inc and its suppliers
 * and may be covered by U.S. and Foreign Patents, patents in process, and are
 * protected by trade secret or copyright law. Dissemination of this information
 * or reproduction of this material is strictly forbidden unless prior written
 * permission is obtained from Invicara Inc.
 */

import React, {useEffect, useState, useCallback, useMemo, useContext, useRef} from "react";
import {Entities} from "@invicara/ipa-core/modules/IpaRedux";

import {
    withEntitySearch
} from "@invicara/ipa-core/modules/IpaPageComponents";
import EntityDetailBottomPanelContent from "./EntityDetailBottomPanelContent";
import NavigatorSource from "./NavigatorSource";
import {compose} from "redux";
import {connect, useDispatch, useSelector} from "react-redux";
import {Button, ButtonGroup} from "@material-ui/core";

const EntityClearSearchButton = ({buttonStyle, viewerMode, onClearSearchAndFilters, onGroupOrFilterChange}) => {

    const searchEntityType = useSelector(Entities.getCurrentEntityType);
    const dispatch = useDispatch();

    const clearSearchAndFilters = () => {
        onGroupOrFilterChange({entityType: searchEntityType, query: null, groups: null, filters: null})
        dispatch(Entities.clearEntities([]));
        onClearSearchAndFilters && onClearSearchAndFilters();
    }


    return <ButtonGroup size="small" variant="contained" >
        <Button title={"Reset Search"}  disableElevation styles={buttonStyle} size="small" className="GenericMatGroupButton" disabled={viewerMode!==NavigatorSource.SEARCH} onClick={clearSearchAndFilters}><i className="fas fa-eraser"/></Button>
    </ButtonGroup>
}

export default withEntitySearch(EntityClearSearchButton)
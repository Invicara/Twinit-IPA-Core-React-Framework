import React from "react";
import {Entities} from "@invicara/ipa-core/modules/IpaRedux";

import {
    withEntitySearch
} from "@invicara/ipa-core/modules/IpaPageComponents";
import NavigatorSource from "./NavigatorSource";
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
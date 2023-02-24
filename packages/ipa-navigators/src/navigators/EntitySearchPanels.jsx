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

import React from "react";
import PropTypes from "prop-types";

import {
    EntitySelectionPanel,
    TreeSelectMode,
    withEntitySearch, EntityListView
} from "@invicara/ipa-core/modules/IpaPageComponents";
import {
    branchNodeRendererOld as branchNodeRenderer,
    leafNodeRendererOld as leafNodeRenderer
} from "@invicara/ipa-core/modules/IpaUtils";
import SearchModelessTab from "./SearchModelessTab";
import {compose} from "redux";
import {connect} from "react-redux";
import {Entities} from "@invicara/ipa-core/modules/IpaRedux";
import _ from 'lodash'
import {StackableDrawerContainer, StackableDrawer} from "@invicara/ipa-core/modules/IpaDialogs";
import EntityDetailBottomPanel from "./EntityDetailBottomPanel";
import NavigatorSource from "./NavigatorSource";
import EntityDetailBottomPanelContent from "./EntityDetailBottomPanelContent";

//TODO: add dispatcher instead of this.props.onDetailEntityChanged
class EntitySearchPanels extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            detailEntity: undefined,
            isPageLoading: true
        }
    }

    async componentDidMount() {
        //When the page mounts load the async data (script and other)
        //and then create the column info for the upload table
        //this.setState({isPageLoading: true});
        this.props.setViewerSyncOn()
        this.setState({isPageLoading: false});
        this.props.onDetailEntityChanged(this.state.detailEntity);
    }

    handleEntityChange = (event, newEntityType) => {
        //this.props.clearEntities()
        this.props.updateEntityType(this.props.getPerEntityConfig()[newEntityType]);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //fetched entities changed, determine if we should reset bottom panel
        if(this.props.allEntities !== prevProps.allEntities /*most likely fetch or entity type switch has happened on the genericEntity redux slice*/){
            //reset detail entity
            if(this.state.detailEntity) {
                this.setState({detailEntity : undefined});
            }
        }

        //if we caught new entities clicked on the navigator, force selections to update
        if(this.props.viewerMode===NavigatorSource.SEARCH && (this.props.viewerSelectedEntities !== prevProps.viewerSelectedEntities)){
            this.handleEntitySelectionFromViewer(this.props.viewerSelectedEntities);
        }
        //let parent know, that detailed entity has changed
        if((this.state.detailEntity !== prevState.detailEntity)){
            this.props.onDetailEntityChanged(this.state.detailEntity);
        }
    }

    getCurrentEntityConfig = () => {
        return this.props.perEntityConfig[this.props.entitySingular];
    }

    tableEntities = () => _.isEmpty(this.props.isolatedEntities) ? this.props.allEntities : this.props.isolatedEntities;

    actionSuccess = (actionType, newEntity, result) => {
        this.props.onReloadSearchTokenChanged(Math.floor((Math.random() * 100) + 1));
        this.props.onEntityChange(actionType, newEntity, result);
    }

    getTableActions = () => {
        let actions = this.getCurrentEntityConfig().actions
        if (!_.isObject(actions)) {
            return undefined;
        }
        return {...actions, onSuccess: this.actionSuccess, doEntityAction: this.props.doEntityAction};
    }

    handleEntityFilterSelection = (entities) => {
        let intersectionOfSelectedandIsolatedEntities = this.props.selectedEntities.filter((entity) => entities.includes(entity));
        intersectionOfSelectedandIsolatedEntities = intersectionOfSelectedandIsolatedEntities.map(e => ({...e, checked: true}))
        this.handleEntitySelection(intersectionOfSelectedandIsolatedEntities);
        this.props.setIsolatedEntities(entities);
    }

    handleEntitySelection = (entities) => {
        const previouslySelected = this.props.selectedEntities;
        const checkedEntities = entities.filter(e => e.checked);
        let unchecked = previouslySelected.filter(e => !checkedEntities.includes(e));
        let checked = checkedEntities.filter(e => !previouslySelected.includes(e));
        if((unchecked.length>0) || (checked.length>0)) {
            //select or deselect
            this.setState({detailEntity: checked.length>1 ? checked[checked.length-1] : checked[0]});
        }
        this.props.setSelectedEntities(checkedEntities);
    }

    handleEntitySelectionOnDetail = (entity) => {
        const clickedEntity = {...entity,checked: !entity.checked};
        let unchecked = !clickedEntity.checked ? [clickedEntity] : [];
        let checked = unchecked.length>0 ? [] : [clickedEntity];
        if(clickedEntity.checked){
            //select
            this.setState({detailEntity: clickedEntity});
            this.props.setSelectedEntities(this.props.selectedEntities.concat([clickedEntity]));
        } else {
            //deselect
            const checkedEntities = this.props.selectedEntities.filter((e)=>e._id!==clickedEntity._id);
            this.setState({detailEntity: checkedEntities.length>0 ? checkedEntities[checkedEntities.length-1] : undefined});
            this.props.setSelectedEntities(checkedEntities);
        }
    }

    handleEntitySelectionFromViewer = viewerSelectedArrayOfIds => {
        this.props.selectEntitiesFromModels(viewerSelectedArrayOfIds);
        const mockEmptyEntities = viewerSelectedArrayOfIds.map(o=>{_id: o.id});
        //TODO: set new detail entity after the component updates?
        this.setState({detailEntity: mockEmptyEntities.length>0 ? mockEmptyEntities[mockEmptyEntities.length-1] : undefined});
    }

    render() {

        const config = this.getCurrentEntityConfig();

        const nonGroupableProps = config?.entitySelectionPanel?.nonGroupableProperties || [];
        const nonFilterableProps = config?.entitySelectionPanel?.nonFilterableProperties || [];
        const defaultGroups = config?.entitySelectionPanel?.defaultGroups || [];

        console.log()
        return (
            <React.Fragment>
                <div className='navigator-view__drawers'>
                    <div className='navigator-drawer-container'>
                        <div className='navigator-drawer-title-bar'>
                            <i className={"fas fa-search"}></i>
                        </div>
                        <StackableDrawer level={1} defaultOpen={false} isDrawerOpen={this.props.viewerMode===NavigatorSource.SEARCH && this.props.isSearchDrawerOpen}>
                            <div className='navigator-drawer-content'>
                                <SearchModelessTab
                                    config={this.props.perEntityConfig}
                                    fetch={this.props.getFetcher}
                                    /*queryParams={this.getQueryParams()}*/
                                    queryParamsPerEntityType={this.props.queryParamsPerEntityType}
                                    currentTab={this.props.entitySingular}
                                    handleTabChange={this.handleEntityChange}
                                    reloadToken={this.props.reloadSearchToken}
                                />
                            </div>
                        </StackableDrawer>
                    </div>
                    <div className='navigator-drawer-container'>
                        <div className='navigator-drawer-title-bar'>
                            <i className={"fas fa-filter"}></i>
                        </div>
                        <StackableDrawer level={3} defaultOpen={false} isDrawerOpen={this.props.viewerMode===NavigatorSource.SEARCH && this.props.isFilterDrawerOpen}>
                            <div className='navigator-drawer-content'>
                                <EntitySelectionPanel
                                    selectedGroups={this.props.groups}
                                    selectedFilters={this.props.appliedFilters}
                                    selectedEntities={this.props.isolatedEntities}
                                    fetching={this.props.fetching}
                                    entities={this.props.allEntities}
                                    onGroupOrFilterChange={this.props.onGroupOrFilterChange}
                                    leafNodeRenderer={leafNodeRenderer}
                                    branchNodeRenderer={branchNodeRenderer}
                                    name={this.props.entitySingular + "_selection_panel"}
                                    onSelect={this.handleEntityFilterSelection}
                                    treeSelectMode={TreeSelectMode.NONE_MEANS_NONE}
                                    entitySingular={this.props.entitySingular}
                                    entityPlural={this.props.entityPlural}
                                    nonFilterableProperties={nonFilterableProps}
                                    nonGroupableProperties={nonGroupableProps}
                                    defaultGroups={defaultGroups}
                                />
                            </div>
                        </StackableDrawer>
                    </div>
                    <div className='navigator-drawer-container'>
                        <div className='navigator-drawer-title-bar'>
                            <i className={"fas fa-list"}></i>
                        </div>
                        <StackableDrawer level={2} defaultOpen={false} isDrawerOpen={this.props.viewerMode===NavigatorSource.SEARCH && this.props.isDataDrawerOpen} fixedWidth={500}>
                            <div className='navigator-drawer-content'>
                                <EntityListView
                                    config={config.tableView.component}
                                    entities={this.tableEntities()}
                                    actions={this.getTableActions()}
                                    context={this.context}
                                    selectedEntities={this.props.selectedEntities}
                                    onChange={this.handleEntitySelection}
                                    onDetail={this.handleEntitySelectionOnDetail}
                                    entitySingular={this.props.entitySingular}
                                    onSortChange={this.props.onEntityListSortChange}
                                />
                            </div>
                        </StackableDrawer>
                    </div>
                </div>



            </React.Fragment>
        );
    }
};

const {
    clearEntities,
    getAllCurrentEntities,
    getAppliedFilters,
    getFetchingCurrent,
    isSelectingEntities,
    setIsolatedEntities,
    setEntities,
    setViewerSyncOn,
    getIsolatedEntities,
    getSelectedEntities,
    getCurrentEntityType,
    selectEntitiesFromModels,
} = Entities;

const mapStateToProps = state => ({
    allEntities: getAllCurrentEntities(state),
    fetching: getFetchingCurrent(state),
    isSelectingEntity: isSelectingEntities(state),
    appliedFilters: getAppliedFilters(state),
    isolatedEntities: getIsolatedEntities(state),
    selectedEntities: getSelectedEntities(state),
    currentEntityType: getCurrentEntityType(state),
});

const mapDispatchToProps = {
    setViewerSyncOn,
    setEntities,
    setIsolatedEntities,
    clearEntities,
    selectEntitiesFromModels,
}

export default compose(
    withEntitySearch,
    connect(mapStateToProps, mapDispatchToProps),
)(EntitySearchPanels)
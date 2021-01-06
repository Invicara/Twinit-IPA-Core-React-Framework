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

import React from "react"
import PropTypes from "prop-types"
import _ from 'lodash'

import {StackableDrawer} from "../../IpaControls/StackableDrawer";
import EnhancedFetchControl from "../../IpaControls/EnhancedFetchControl";
import {applyFilters} from "../../IpaControls/FilterControl"

import {EntityListView} from "./EntityListView";
import EntitySelectionPanel, {TreeSelectMode} from "./EntitySelectionPanel"
import EntityDetailPanel from "./EntityDetailPanel"
import {connect} from "react-redux";
import {
    getAllCurrentEntities,
    getAppliedFilters,
    getFetchingCurrent,
    getFilteredEntities
} from "../../redux/slices/entities";
import {compose} from "@reduxjs/toolkit";
import withEntitySearch from "./WithEntitySearch";
import {branchNodeRenderer, leafNodeRenderer} from "../../IpaUtils/TreeRendererHelper"

import './EntityView.scss'


const tableComponents = {
    'EntityListView': EntityListView,
};

class EntityView extends React.Component {

    state = {displayDetail: false}

    openDetail = entity => {
        this.setState({displayDetail: true})
        this.props.entitiesSelected([entity]);
    }

    openSummary = () => {
        this.setState({displayDetail: false})
        this.props.entitiesSelected([]);
    }

    onTreeSelect = (entities) => {
        if (this.state.displayDetail == true && entities.length > 1) {
            this.setState({displayDetail: false})
        }
        this.props.entitiesSelected(entities)
    }

    tableEntities = () => _.isEmpty(this.props.selectedEntities) ? this.props.currentEntities : this.props.selectedEntities;

    onGroupOrFilterChange = (changes) => {
      this.setState({displayDetail: false})
      this.props.onGroupOrFilterChange(changes)
    }
    
    actionSuccess = (actionType, newEntity, result) => {
      
      if (actionType === 'delete') this.openSummary();
      this.props.onEntityChange(actionType, newEntity, result);
      
    }

    render() {
        const {handler, entitySingular} = this.props;

        if (this.props.isPageLoading) return null;

        const TableComponent = tableComponents[_.get(handler, 'config.tableView.component.name')];

        let actions = {}
        let tableActions = {}
        if (this.props.handler.config.actions) {
            actions = Object.assign({}, this.props.handler.config.actions)
            actions.onSuccess = this.actionSuccess
            actions.doEntityAction = this.props.doEntityAction

            tableActions.onSuccess = this.actionSuccess
            tableActions.doEntityAction = this.props.doEntityAction

            let actionNames = Object.keys(actions);
            actionNames.forEach((action) => {
                if (actions[action].showOnTable)
                    tableActions[action] = actions[action];
            });

        }

        let pageContent;
        if (this.props.fetching) {
            pageContent = <span className="info-message">Retrieving data</span>
        } else if (this.props.currentEntities.length > 0) {
            console.log("displayDetail", this.state.displayDetail)
            if (this.state.displayDetail == true) {
                pageContent = <EntityDetailPanel
                    context={this.context}
                    onSummary={this.openSummary}
                    entity={this.props.selectedEntities[0]}
                    config={this.props.handler.config}
                    actions={actions}
                    dataGroups={this.props.availableDataGroups[this.props.entitySingular]}
                    loadingDataGroups={this.props.loadingAvailableDataGroups}
                    getData={this.props.getEntityExtendedData(this.props.handler.config.data)}
                />

            } else {

                pageContent = <TableComponent
                    config={handler.config.tableView.component}
                    onDetail={this.openDetail}
                    entities={this.tableEntities()}
                    actions={tableActions}
                    context={this.context}
                    entityPlural={this.props.entityPlural}
                    entitySingular={this.props.entitySingular}

                />
            }
        } else {
            pageContent = <span className="info-message">No data</span>
        }

        // make sure query id is numeric
        let query = Object.assign({}, this.props.queryParams.query)
        if (query.id && _.isNaN(parseInt(query.id))) {
            query.id = "" + handler.config.selectBy.findIndex(sb => query.id == sb.id)
        }

        const scriptName = this.props.handler.config.entityData[entitySingular].script
        const _doFetch = (...args) => {
            this.setState({displayDetail: false})
            this.props.getFetcher(scriptName)(...args)
        }

        const nonGroupableProps = (this.props.handler.config.entitySelectionPanel ? this.props.handler.config.entitySelectionPanel.nonGroupableProperties : []) || [];
        const nonFilterableProps = (this.props.handler.config.entitySelectionPanel ? this.props.handler.config.entitySelectionPanel.nonFilterableProperties : []) || [];
        const defaultGroups = (this.props.handler.config.entitySelectionPanel ? this.props.handler.config.entitySelectionPanel.defaultGroups : []) || [];

        return (
            <div className='entities-view'>
                <StackableDrawer level={1} iconKey={'fa-search'}>
                    <div className='fetch-container'>
                        <EnhancedFetchControl
                            initialValue={query}
                            selectors={handler.config.selectBy}
                            doFetch={_doFetch}
                        />
                    </div>
                </StackableDrawer>
                <StackableDrawer level={2} iconKey={'fa-sitemap'}>
                    <div className='tree-container'>
                        <EntitySelectionPanel
                            selectedGroups={this.props.groups}
                            selectedFilters={this.props.appliedFilters}
                            selectedEntities={this.props.selectedEntities}
                            fetching={this.props.fetching}
                            entities={this.props.allEntities}
                            onSelect={this.onTreeSelect}
                            treeSelectMode={TreeSelectMode.NONE_MEANS_ALL}
                            onGroupOrFilterChange={this.onGroupOrFilterChange}
                            leafNodeRenderer={leafNodeRenderer}
                            branchNodeRenderer={branchNodeRenderer}
                            nonFilterableProperties={nonFilterableProps}
                            nonGroupableProperties={nonGroupableProps}
                            name={this.props.entitySingular + "_selection_panel"}
                            entitySingular={this.props.entitySingular}
                            entityPlural={this.props.entityPlural}
                            defaultGroups={defaultGroups}
                        />
                    </div>
                </StackableDrawer>
                <div className='content'>{pageContent}</div>
            </div>
        )
    }
}

EntityView.contextTypes = {
    actions: PropTypes.object,
    ifefPlatform: PropTypes.object,
    ifefSnapper: PropTypes.object,
    ifefNavDirection: PropTypes.string,
    ifefShowPopover: PropTypes.func,
    ifefUpdatePopover: PropTypes.func,
    ifefUpdatePopup: PropTypes.func,
    ifefShowModal: PropTypes.func
};


const mapStateToProps = state => ({
    allEntities: getAllCurrentEntities(state),
    fetching: getFetchingCurrent(state),
    currentEntities: getFilteredEntities(state),
    appliedFilters: getAppliedFilters(state)
});

export default compose(
    withEntitySearch,
    connect(mapStateToProps),
)(EntityView)

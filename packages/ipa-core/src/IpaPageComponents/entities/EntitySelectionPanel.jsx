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

import {nestedGroup} from "../../IpaUtils/helpers"

import FilterControl from "../../IpaControls/FilterControl"
import GroupControl from "../../IpaControls/GroupControl"
import FancyTreeControl from "../../IpaControls/FancyTreeControl"
import _ from "lodash";
import {listEquals} from "../../IpaUtils/compare";
import {getFilteredEntitiesBy} from "../../IpaUtils/entities";

const GROUP_SELECT_STYLES = {
    control: styles => ({...styles, width: '90%', margin: '10px 0'}),
    container: styles => ({...styles, display: 'block', width: '90%'})
};

const FILTER_SELECT_STYLES = {
    control: styles => ({...styles, width: '100%', margin: '10px 0'}),
    container: styles => ({...styles, display: 'block', width: '100%', marginBottom: '0px'})
};

export const TreeSelectMode = {
    NONE_MEANS_ALL: "noneMeansAll",
    NONE_MEANS_NONE:"noneMeansNone"
};
// Groups were previously stored in sessionStorage which was persisted too long
// and caused defaultGroups and selectedGroups to not get picked up 
class EntitySelectionPanel extends React.Component {
  constructor(props) {
    super(props)

    let groups = [];

    if(!_.isEmpty(this.props.selectedGroups)) {
      groups = this.props.selectedGroups
    } else if(this.props.defaultGroups) {
      groups = this.props.defaultGroups
    }

    this.state = {
      entities: [],
      tree: {},
      numFilteredEntities: this.props.entities.length,
      numEntities: this.props.entities.length
      //removed props-to-state copy of filters and groups 
      // we now compute them as derived props (getSelectedGroups and getSelectedFilters)
    }    
  }

  //FIXME Remove this props-to-state copy
  static getDerivedStateFromProps(props, state) {

    let derivedState = {...state}
    derivedState.uniquePropNames = getUniquePropNames(props.entities)
    derivedState.availableFilters = getAvailableFilterValues(props.entities, derivedState.uniquePropNames, props.nonFilterableProperties)
    let {tree, numFilteredEntities} = makeTree(props, derivedState)
    derivedState.tree = tree
    derivedState.numFilteredEntities = numFilteredEntities
    derivedState.entities = props.entities
    derivedState.numEntities = props.entities.length

    return derivedState
  }

  filtersChanged = (filters) => {
    this.props.onGroupOrFilterChange({filters})
  }

  groupsChanged = (groups) => {
    this.props.onGroupOrFilterChange({groups})
  }

  onSelectLeaves = (leaves) => {
      let selection = []
      if (leaves.length==0 && this.props.treeSelectMode === TreeSelectMode.NONE_MEANS_ALL) {
          selection = getFilteredEntitiesBy(this.props.entities, getSelectedFilters(this.props));
      }
      else {
          leaves.forEach(el => {
              selection.push(this.props.entities.find(e => e._id == el.dataset.nodeId))
          })
      }
      this.onSelectEntities(selection)
  }

  onSelectEntities = (entities) => {
      if (this.props.onSelect) {
          this.props.onSelect(entities);
      }
  }

  onSelectIds = (entityIds) => {
      if (this.props.onSelect) {
          this.props.onSelect(this.props.entities.filter(e => entityIds.includes(e._id)));
      }
  }

  onSelectAll = () => {
      this.onSelectEntities(getFilteredEntitiesBy(this.props.entities, getSelectedFilters(this.props)));
  }
  
  getAvailableGroupValues = () => {
    const nonGroupableProperties = this.props.nonGroupableProperties || [];
    return this.state.uniquePropNames.filter(p => !nonGroupableProperties.includes(p));
  }

  getSelectedIds = _.memoize((_selectedEntities)=>_.map(_selectedEntities, e => e._id));

  render() {

    if (this.props.fetching || !this.props.entities || this.props.entities.length==0) {
      return (
        <div className="entity-tree-panel">
          <div className="centered">
            {this.props.fetching ? "Retrieving data" : "No data"}
          </div>
        </div>
      )
    }

    const countMessage = this.state.numFilteredEntities == this.state.numEntities
        ? <span>{this.state.numEntities} {this.state.numEntities == 1 ? this.props.entitySingular : this.props.entityPlural}</span>
        : <span><b>{this.state.numFilteredEntities}</b> of {this.state.numEntities} Fetched {this.state.numEntities == 1 ? this.props.entitySingular : this.props.entityPlural}</span>;


    const allSelected = this.state.numFilteredEntities === this.props.selectedEntities.length

    const selectedGroups = getSelectedGroups(this.props)
    const selectedFilters = getSelectedFilters(this.props)

    return (
      <div className="entity-tree-panel">
         <label className="title">Group By</label>
         <GroupControl className="entity-group"
                        styles={GROUP_SELECT_STYLES}
                        groups={this.getAvailableGroupValues()}
                        selected={selectedGroups}
                        onChange={this.groupsChanged} />
        <label className="title">Filter By</label>
        <FilterControl className="entities-filter entities-filter--with-count"
                       styles={FILTER_SELECT_STYLES}
                       onChange={this.filtersChanged}
                       filters={selectedFilters}
                       availableFilters={this.state.availableFilters}/>
        <div className="entity-count">
            <span>{countMessage}</span>
        </div>
        <FancyTreeControl className="entity-tree"
          name={this.props.name + "_tree"}
          selectedGroups={selectedGroups}
          renderLeafNode={this.props.leafNodeRenderer}
          renderBranchNode={this.props.branchNodeRenderer}
          onSelect={this.onSelectLeaves}
          onSelectAll={this.onSelectAll}
          onSelectNone={this.onSelectIds}
          onSelectIds={this.onSelectIds}
          selectedIds={this.getSelectedIds(this.props.selectedEntities)}
          allSelected={allSelected}
          treeSelectMode={this.props.treeSelectMode}
          tree={this.state.tree}/>
      </div>
    )
  }
}

const getUniquePropNames = (entities) => {
    let uniquePropNames = new Set()
    entities.forEach(a => Object.keys((a.properties || {})).reduce((s, e) => s.add(e), uniquePropNames))
    let result = [...uniquePropNames]
    result.sort()
    return result
}

const getAvailableFilterValues = (entities, uniquePropNames, nonFilterableProps) => {
  const nonFilterableProperties = nonFilterableProps || [];
  let availableFilters = {}
  uniquePropNames.filter(p => !nonFilterableProperties.includes(p)).forEach(p => {
    let uniquePropValues = new Set()
    entities.forEach(a => {
      if (a.properties) {
        if (a.properties[p]) {
          uniquePropValues.add(a.properties[p].val ? a.properties[p].val : "_empty_")
          availableFilters[p] = { type: a.properties[p].type }
        }
      }
    })
    availableFilters[p].values = [...uniquePropValues]

  });
  availableFilters["Entity Name"] = {values: entities.map(e => e['Entity Name']), type: "text"}
  return availableFilters
}

const getSelectedGroups = (props) => {
  let groups = [];

  if(!_.isEmpty(props.selectedGroups)) {
    groups = props.selectedGroups
  } else if(props.defaultGroups) {
    groups = props.defaultGroups
  }
  
  return groups;
}

const getSelectedFilters = (props) => {
  let filters = [];

  if(!_.isEmpty(props.selectedFilters)) {
    filters = props.selectedFilters
  } else if(props.defaultFilters) {
    filters = props.defaultFilters
  }
  
  return filters;
}

const makeTree = (props, state) => {
    let filteredEntities = getFilteredEntitiesBy(props.entities, getSelectedFilters(props))
    let numFilteredEntities = filteredEntities.length
    let tree = {}
    let groups = getSelectedGroups(props);
    if (groups && groups.length)
        tree = nestedGroup(filteredEntities, groups, (a, p) => a.properties[p] ? a.properties[p].val : null)
    else
        tree = filteredEntities
    return {tree, numFilteredEntities}
}

export default EntitySelectionPanel;

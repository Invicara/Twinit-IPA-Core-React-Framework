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

import FilterControl, {applyFilters} from "../../IpaControls/FilterControl"
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

const LAST_SELECTED_GROUP_KEY = "lastSelectedGroup"
const PROJECT_ID_KEY = 'ipaSelectedProjectId';

class EntitySelectionPanel extends React.Component {
  constructor(props) {
    super(props)

    let groups = [];
    let lastSelectedGroupFromLocalStotage = getLastSelectedGroups(this.props)

    if(!_.isEmpty(this.props.selectedGroups)) {
      groups = this.props.selectedGroups
    } else if(lastSelectedGroupFromLocalStotage !== null) {
      groups = lastSelectedGroupFromLocalStotage
    } else if(this.props.defaultGroups) {
      groups = this.props.defaultGroups
    }

    this.state = {
      entities: [],
      tree: {},
      numFilteredEntities: this.props.entities.length,
      numEntities: this.props.entities.length,
      //FIXME Remove this props-to-state copy
      filters: this.props.selectedFilters || {},
      //domi: added brackets to below, otherwise babel got confused
      groups
    }    
  }

  //FIXME Remove this props-to-state copy
  static getDerivedStateFromProps(props, state) {

    let derivedState = {...state}
    if (state.entities.length>0 && !listEquals(props.entities.map(e => e.id),state.entities.map(e => e.id))) {
      //domi: I am commenting this out... when we add a category node, the applied groups and filters get nuked :/
      //derivedState.groups = []
      //derivedState.filters = {}
    }
    derivedState.uniquePropNames = getUniquePropNames(props.entities)
    derivedState.availableFilters = getAvailableFilterValues(props.entities, derivedState.uniquePropNames, props.nonFilterableProperties)
    let {tree, numFilteredEntities} = makeTree(props, derivedState)
    derivedState.tree = tree
    derivedState.numFilteredEntities = numFilteredEntities
    derivedState.entities = props.entities
    derivedState.numEntities = props.entities.length

    return derivedState
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
      if (!_.isEmpty(prevProps.selectedFilters) && _.isEmpty(this.props.selectedFilters)) {
          this.setState({filters: {}})
      }
      if (!_.isEmpty(prevProps.selectedGroups) && _.isEmpty(this.props.selectedGroups)) {
          this.setState({groups: []})
      }
  }

  filtersChanged = (filters) => {
        this.setState({filters})
        this.props.onGroupOrFilterChange({filters})
  }

  groupsChanged = (groups) => {

    if(_.isEmpty(groups)) {
      groups = [...this.props.defaultGroups];
    }

    const projectId = sessionStorage.getItem(PROJECT_ID_KEY);
    
    sessionStorage.setItem(LAST_SELECTED_GROUP_KEY + this.props.entitySingular + projectId, [groups]);
    
    this.props.onGroupOrFilterChange({groups})
  }

  onSelectLeaves = (leaves) => {
      let selection = []
      if (leaves.length==0 && this.props.treeSelectMode === TreeSelectMode.NONE_MEANS_ALL) {
          selection = getFilteredEntitiesBy(this.props.entities, this.state.filters);
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
      this.onSelectEntities(getFilteredEntitiesBy(this.props.entities, this.state.filters));
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
                       filters={this.state.filters}
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

const getLastSelectedGroups = (props) => {
  let stringifiedGroups = sessionStorage.getItem(
    LAST_SELECTED_GROUP_KEY + props.entitySingular + sessionStorage.getItem(PROJECT_ID_KEY)
  )

  let groups = []

  if(stringifiedGroups) {
    groups = stringifiedGroups.split(',');
  }

  return groups;
}

const getSelectedGroups = (props) => {
  let groups = [];
  let lastSelectedGroupFromLocalStotage = getLastSelectedGroups(props)

  if(!_.isEmpty(props.selectedGroups)) {
    groups = props.selectedGroups
  } else if(lastSelectedGroupFromLocalStotage !== null) {
    groups = lastSelectedGroupFromLocalStotage
  } else if(props.defaultGroups) {
    groups = props.defaultGroups
  }
  
  return groups;
}

const makeTree = (props, state) => {
    let filteredEntities = getFilteredEntitiesBy(props.entities, state.filters)
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

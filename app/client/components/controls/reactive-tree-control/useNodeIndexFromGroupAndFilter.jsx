import React, {useEffect, useState} from "react";

import {nestedGroup} from "../../utils/helpers"
import _ from 'lodash'
import {SelectedStatus} from "../TreeSearch";
import {produce} from "immer";
import {getFilteredEntitiesBy} from "../../../redux/slices/entities-higher-order-reducer";
import {propagateSelectStatusUp} from "./tree-helpers";

export const useNodeIndexFromGroupAndFilter = (groups, filters, entities, selectedEntities, onNodeSelect) => {
  const [nodeIndex, setNodeIndex] =  useState({})

  useEffect(() => {
    setNodeIndex(produce({},nodeIndex => {
      loadIntoNodeIndex(nodeIndex, makeTree(), 1, [])
    }))
  }, [filters,groups]);

  const computeNodeIndexWithSelection = (nodeIndex, selectedEntities) => produce(nodeIndex,nodeIndex => {
    _.values(nodeIndex).forEach(node => {
      const isNodeSelected = selectedEntities.some(el => el._id === _.get(node, 'nodeValue._id'))
      node.selectedStatus = isNodeSelected ? SelectedStatus.SELECTED : SelectedStatus.CLEAR;
      propagateSelectStatusUp(nodeIndex, node.id)
    })
  });

  useEffect(() => {
    const newSelectedEntityIds = _.difference(selectedEntities.map(e => e._id), getSelectedEntitiesInNodeIndex(nodeIndex).map(e => e._id));
    setNodeIndex(produce(nodeIndex => {
      _.values(nodeIndex).forEach(node => {
        const isNodeSelected = newSelectedEntityIds.some(id => id === _.get(node, 'nodeValue._id'))
        if (isNodeSelected) node.parents.forEach(parentId => {
          nodeIndex[parentId].expanded = true
        })
      })
    }))
  }, [selectedEntities]);

  const loadIntoNodeIndex = (nodeIndex, tree, level, parents = []) => {
    const nodes = Array.isArray(tree) ? tree : _.keys(tree);
    const nodeIdFor = (index) => `${_.last(parents) || 'root'}-${index}`;
    nodes.forEach((node, index) => {
      const nodeId = nodeIdFor(index);
      nodeIndex[nodeId] = {
        id: nodeId,
        level: level,
        parents,
        children: [],
        isLeaf: Array.isArray(tree),
        expanded: false,
        selectedStatus: SelectedStatus.CLEAR,
        nodeValue: node
      }
      if(!Array.isArray(tree)) loadIntoNodeIndex(nodeIndex, tree[node], level + 1, [...parents, nodeId])
    });
    if (!_.isEmpty(parents)) nodeIndex[_.last(parents)].children = nodes.map((_, i) => nodeIdFor(i))
  }

  const makeTree = () => !_.isEmpty(groups) ?
      nestedGroup(getFilteredEntitiesBy(entities, filters), groups, (a, p) => a.properties[p] ? a.properties[p].val : null) : entities;

  const getSelectedEntitiesInNodeIndex = (nodeIndex) =>
    _.values(nodeIndex).filter(node => node.isLeaf && node.selectedStatus === SelectedStatus.SELECTED).map(n => n.nodeValue);

  const handleNodeIndexChange = (newNodeIndex) => {
    setNodeIndex(newNodeIndex)
    onNodeSelect(getSelectedEntitiesInNodeIndex(newNodeIndex))
  }

  return [computeNodeIndexWithSelection(nodeIndex, selectedEntities) , handleNodeIndexChange]
}
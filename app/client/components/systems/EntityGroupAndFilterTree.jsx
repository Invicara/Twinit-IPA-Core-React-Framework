import React from "react";
import GroupAndFilterControl from "../entities/GroupAndFilterControl";
import {StackableDrawer} from "../controls/StackableDrawer";
import ReactiveTreeControl from "../controls/reactive-tree-control/ReactiveTreeControl";
import {useNodeIndexFromGroupAndFilter} from "../controls/reactive-tree-control/useNodeIndexFromGroupAndFilter";

export const EntityGroupAndFilterTree = ({entities, groups, filters, onFilterChange, onGroupChange,
                                      nonFilterableProperties = [], nonGroupableProperties = [], fetching = false,
                                      selectedEntities, onEntitiesSelected
}) => {
    const [nodeIndex, handleNodeIndexChange] = useNodeIndexFromGroupAndFilter(groups,filters, entities, selectedEntities, onEntitiesSelected);

    return <div>
            <GroupAndFilterControl
                fetchedEntities={entities}
                selectedGroups={groups}
                selectedFilters={filters}
                fetching={fetching}
                onFilterChange={onFilterChange}
                onGroupChange={onGroupChange}
                nonFilterableProperties={nonFilterableProperties}
                nonGroupableProperties={nonGroupableProperties}
            />
            <ReactiveTreeControl nodeIndex={nodeIndex} onNodeIndexChange={handleNodeIndexChange}/>
    </div>
}

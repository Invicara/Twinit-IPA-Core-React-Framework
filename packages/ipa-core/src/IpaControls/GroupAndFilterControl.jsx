import React from "react";
import FilterControl from "./FilterControl"
import GroupControl from "./GroupControl"
import _ from "lodash";
import {distinct} from "../IpaUtils/list";

const GROUP_SELECT_STYLES = {
    control: styles => ({...styles, width: '90%', margin: '10px 0'}),
    container: styles => ({...styles, display: 'block', width: '90%'})
};

const FILTER_SELECT_STYLES = {
    control: styles => ({...styles, width: '100%', margin: '10px 0'}),
    container: styles => ({...styles, display: 'block', width: '100%'})
};

const distinctPropNames = (entities) => distinct(entities.flatMap(e => _.keys(e.properties))).sort();

const makeFilterFrom = (entities) => (propName) => ({
    name: propName,
    type: entities.find(e => _.get(e, `properties[${propName}].type`)).properties[propName].type,
    values: distinct(entities.map(e => _.get(e.properties,`${propName}.val`) || "_empty_"))
})

const GroupAndFilterControl = ({fetchedEntities, nonGroupableProperties = [], nonFilterableProperties = [], fetching,
                               selectedFilters, selectedGroups, onGroupChange, onFilterChange}) => {

    const availableGroups = () => _.difference(distinctPropNames(fetchedEntities), nonGroupableProperties);

    const availableFilters = ()  => _.difference(distinctPropNames(fetchedEntities), nonFilterableProperties)
        .map(makeFilterFrom(fetchedEntities))
        .reduce((filtersMap, filter) => ({...filtersMap, [filter.name]: filter}),
            {"Entity Name": {values: fetchedEntities.map(e => e['Entity Name']), type: "text"} }
        );

    return (
        <div className="entity-tree-panel">
            {fetching && <div className="centered">Retrieving data</div>}
            {_.isEmpty(fetchedEntities) ?
                <div className="centered">No results</div> :
                <>
                    <label>Group by:</label>
                    <GroupControl className="entity-group"
                                  styles={GROUP_SELECT_STYLES}
                                  groups={availableGroups()}
                                  selected={selectedGroups}
                                  onChange={onGroupChange}/>
                    <label>Filter by:</label>
                    <FilterControl className="entities-filter"
                                   styles={FILTER_SELECT_STYLES}
                                   onChange={onFilterChange}
                                   filters={selectedFilters}
                                   availableFilters={availableFilters()}/>
                </>
            }
        </div>
    )
}


export default GroupAndFilterControl;

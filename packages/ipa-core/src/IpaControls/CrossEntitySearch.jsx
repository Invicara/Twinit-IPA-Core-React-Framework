import React, {useState,useMemo, useCallback} from "react"
import {TextSearch} from "./TextSearch";
import {EntityListView} from "../IpaPageComponents/entities/EntityListView";
import produce from "immer";

import clsx from "clsx";
import _ from 'lodash'

import ScriptHelper from "../IpaUtils/ScriptHelper";
import './CrossEntitySearch.scss'
import {RoundCheckbox, useChecked} from "./Checkboxes";

const CrossEntitySearch = ({searchableEntities = [], script, dashboard: {doAction}}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [fetching, setFetching] = useState(false);
    const [fetchedEntities, setFetchedEntities] = useState([]);
    const entities = useMemo(()=>searchableEntities.map(produce(se => {
        se.checked = se.default
    })),[searchableEntities]);
    const {handleCheck, items: rawSearchableEntities} = useChecked(entities);

    const onFetch = useCallback(async () => {
        setFetching(true)
        setFetchedEntities(await ScriptHelper.executeScript(script,
            {
                entityTypes: rawSearchableEntities.filter(et => et.checked).map(et => et.entityType.plural),
                searchQuery: {$text: {$search: searchTerm}}
            }
        ))
        setFetching(false)
    },[rawSearchableEntities,searchTerm]);

    const searchEntities = <div>
        <div>Search among:</div>
        <div className={'entity-types'}>{
            rawSearchableEntities.map(et => <div key={et.entityType.plural}><RoundCheckbox checked={et.checked}
                                                      onChange={() => handleCheck(et)}/>{et.entityType.plural}</div>)
        }</div>
    </div>

    const navigate = useCallback((entity) => {
        const currentSearchableEntity = rawSearchableEntities.find(e => e.entityType.plural === entity.entityType);
        doAction({
            type: "navigate", //TODO model action types as enum rather than string
            navigateTo: currentSearchableEntity.handler,
            query: {
                selectedEntities:  [entity._id],
                entityType: currentSearchableEntity.entityType.singular
            }
        })
    },[rawSearchableEntities]);

    const config = useMemo(()=>{ return {
        columns: [{
            "name": "Entity Name",
            "accessor": "entityName"
        }, {
            "name": "Entity Type",
            "accessor": "entityType"
        }]
    }},[]);

    return (
        <div className={'cross-entity-search'}>
            <div className={'search-term'}>
                <TextSearch
                    display={'Search entities'}
                    touched={!_.isEmpty(searchTerm)}
                    currentValue={searchTerm}
                    additionalOptions={searchEntities}
                    onChange={setSearchTerm}
                    onFetch={onFetch}
                    isFetching={fetching}
                />
                {_.isEmpty(fetchedEntities) && <div className={'no-results'}>No results fetched</div>}
            </div>
            <div className={clsx('search-results', _.isEmpty(fetchedEntities) && 'collapsed')}>
                <EntityListView config={config}
                                entities={fetchedEntities} onDetail={navigate}/>
            </div>
        </div>
    )
}

export default CrossEntitySearch;



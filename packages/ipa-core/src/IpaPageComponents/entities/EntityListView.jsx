import React, {useState, useMemo, useEffect, useCallback} from "react";
import clsx from "clsx";
import EntityActionsPanel from "./EntityActionsPanel";
import _ from 'lodash'

import './EntityListView.scss'
import {RoundCheckbox, useChecked} from "../../IpaControls/Checkboxes";
import {isValidUrl} from '../../IpaUtils/helpers'
import useSortEntities from "./sortEntities";

export const EntityListView = ({config, entities, onDetail, actions, context, onChange, onSortChange, selectedEntities, entityPlural = 'Entities', entitySingular = 'Entity'}) => {


    let checkableEntities = useMemo(()=>entities.map((entity) => {
        let checked = !_.isEmpty(selectedEntities) && 
            selectedEntities.findIndex((selectedEntity) => entity._id === selectedEntity._id) !== -1;
        return {...entity, checked}
    }),[entities,selectedEntities]);

    const checkCallback = useCallback((entity) => {
        let newEntities = checkableEntities.map((e) => {
            return e._id === entity._id ? {...e, checked: !entity.checked} : e;
        })
        onChange?.(newEntities);
    },[entities,selectedEntities]);

    const isAllChecked = checkableEntities.every(e => e.checked)

    const allCheckCallback = useCallback(() => {
        let newEntities = entities.map(e => ({...e, checked: !isAllChecked}));
        onChange?.(newEntities)
    },[entities,selectedEntities]);


    //If the selectedEntities props is used, we assume a controlled behaviour, uncontrolled otherwise
    let allChecked, handleCheck, handleAllCheck, entityInstances;
    if(selectedEntities) {
        allChecked = isAllChecked;
        handleCheck = checkCallback;
        handleAllCheck = allCheckCallback;
        entityInstances = checkableEntities;
    } else {
        const checkedObject = useChecked(entities, checkCallback, allCheckCallback);
        allChecked = checkedObject.allChecked;
        handleCheck = checkedObject.handleCheck;
        handleAllCheck = checkedObject.handleAllCheck;
        entityInstances = checkedObject.items;
    }
    const {sortEntitiesBy, currentSort: currentSort} = useSortEntities(entitySingular, onSortChange);

    const handleColumnClick = useCallback((col) => () => sortEntitiesBy(col.accessor),[sortEntitiesBy]);

    const buildHeader = useCallback((col) => {
        return <div key={col.name} onClick={handleColumnClick(col)} className='header-column'>
            {col.name} {col.accessor == currentSort.property &&
            <i className={currentSort.order == 'asc' ? "fas fa-angle-double-up" : "fas fa-angle-double-down"}></i>
        }
        </div>
    },[sortEntitiesBy,currentSort]);
    
    const buildCell = useCallback((instance) => (col, i) => {
        const value = _.get(instance, col.accessor);
        let dispValue = value && typeof value === 'string' ? value : value ? value.val : null
        dispValue = isValidUrl(dispValue) ? <a href={dispValue} target="_blank">{dispValue}</a> : dispValue

        const first = i === 0;
        return <div key={i} className={clsx({
            'content-column': true,
            ' first': first
        })}
                    {...(first && {onClick: () => onDetail(instance)})}>
            {dispValue}
        </div>
    },[onDetail]);

    const entityType = useMemo(()=> {return {
        singular: entitySingular,
        plural: entityPlural
    }},[entitySingular,entityPlural]);

    return <div className={`entity-list-view-root entity-table ${config?.className || ""}`}>
        {actions && <div className='actions-panel'>
            <EntityActionsPanel
                actions={actions}
                entity={entityInstances.filter(inst => inst.checked)}
                type={entityType}
                context={context}
            />
        </div>}
        <div className='entity-list-view-count'>
            {`Showing ${entities.length} ${entities.length > 1 ? entityPlural : entitySingular}`}
        </div>
        <div className='header-row'>
            {config?.multiselect && <div className='header-column checkbox'>
                <RoundCheckbox checked={allChecked} onChange={handleAllCheck}/>
            </div>}
            {config?.columns.map(col => buildHeader(col))}
        </div>
        {_.orderBy(entityInstances, currentSort.valueAccessor, currentSort.order).map(instance => {
            const handleChange = () => handleCheck(instance)
            return <div key={instance._id} className='content-row'>
                {config?.multiselect && <div className='content-column checkbox'>
                    <RoundCheckbox checked={instance.checked} onChange={handleChange}/>
                </div>}
                {config?.columns.map(buildCell(instance))}
            </div>})
        }
    </div>
}




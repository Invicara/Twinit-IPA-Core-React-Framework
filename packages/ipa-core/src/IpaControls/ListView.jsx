import React, {useState, useContext, useEffect} from "react";
import clsx from "clsx";
import EntityActionsPanel from "./EntityActionsPanel";
import _ from 'lodash'

import './EntityListView.scss'
import {RoundCheckbox, useChecked} from "../../IpaControls/Checkboxes";
import {isValidUrl} from '../../IpaUtils/helpers'


export const sortEntities = (entitySingular, onSortChange) =>{
    const ASCENDING_ORDER = 'asc';
    const DESCENDING_ORDER = 'desc';
    const ENTITY_LIST_SORT_PREFERENCE = 'entityListSortPreference';

    const key = ENTITY_LIST_SORT_PREFERENCE + entitySingular;
    const sessionPreference = sessionStorage.getItem(key);
    const sortPreference = sessionPreference ? JSON.parse(sessionPreference) : {property: 'Entity Name', valueAccessor: 'Entity Name', order: ASCENDING_ORDER};      

    const [currentSort, setSort] = useState(sortPreference);
    
    const sortEntitiesBy = (colAccessor) => {
        let order = currentSort.property == colAccessor ? currentSort.order == ASCENDING_ORDER ? DESCENDING_ORDER : ASCENDING_ORDER : ASCENDING_ORDER;
        //TODO: we might need a better condition than to check if the column accessor has a . in it. This condition will hold for all properties however.
        const sortValue = {valueAccessor: !colAccessor.includes('.') || colAccessor.includes('.val') ? colAccessor : colAccessor + '.val', property: colAccessor, order: order};
        setSort(sortValue);
        sessionStorage.setItem(key, JSON.stringify(sortValue));
    }

    useEffect(()=>{
        onSortChange && onSortChange(currentSort);
    },[currentSort])

    return {sortEntitiesBy, currentSort}
}

export const EntityListView = ({config, entities, onDetail, actions, context, onChange, onSortChange, selectedEntities, entityPlural = 'Entities', entitySingular = 'Entity'}) => {


    let checkableEntities = entities.map((entity) => {
        let checked = !_.isEmpty(selectedEntities) && 
            selectedEntities.findIndex((selectedEntity) => entity._id === selectedEntity._id) !== -1;
        return {...entity, checked}
    })

    const isAllChecked = checkableEntities.every(e => e.checked)

    const checkCallback = (entity) => {
        let newEntities = checkableEntities.map((e) => {
            return e._id === entity._id ? {...e, checked: !entity.checked} : e;
        })
        onChange?.(newEntities);
    }

    const allCheckCallback = () => {
        let newEntities = entities.map(e => ({...e, checked: !isAllChecked}));
        onChange?.(newEntities)
    }


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
    const {sortEntitiesBy, currentSort: currentSort} = sortEntities(entitySingular, onSortChange);

    
    const buildCell = instance => (col, i) => {
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
    };    

    let entityType = {
        singular: entitySingular,
        plural: entityPlural
    }

    return <div className={`entity-list-view-root ${config.className}`}>
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
            {config.multiselect && <div className='header-column checkbox'>
                <RoundCheckbox checked={allChecked} onChange={handleAllCheck}/>
            </div>}
            {config.columns.map(col => {
                const handleColumnClick = () => sortEntitiesBy(col.accessor)
                return <div key={col.name} onClick={handleColumnClick} className='header-column'>
                    {col.name} {col.accessor == currentSort.property && 
                        <i className={currentSort.order == 'asc' ? "fas fa-angle-double-up" : "fas fa-angle-double-down"}></i>
                    }
                </div>
            })}
        </div>
        {_.orderBy(entityInstances, currentSort.valueAccessor, currentSort.order).map(instance => {
            const handleChange = () => handleCheck(instance)
            return <div key={instance._id} className='content-row'>
                {config.multiselect && <div className='content-column checkbox'>
                    <RoundCheckbox checked={instance.checked} onChange={handleChange}/>
                </div>}
                {config.columns.map(buildCell(instance))}
            </div>})
        }
    </div>
}

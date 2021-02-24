import React, {useEffect, useState} from "react";
import Checkbox from "@material-ui/core/Checkbox";
import CheckedCircle from '@material-ui/icons/CheckCircle';
import UncheckedCircle from '@material-ui/icons/RadioButtonUnchecked';
import CheckIcon from '@material-ui/icons/Check';
import CheckBox from '@material-ui/icons/CheckBox';
import clsx from "clsx";
import EntityActionsPanel from "./EntityActionsPanel";
import {usePrevious} from "../../IpaUtils/usePrevious";
import {listEquals, setIncludesBy} from "../../IpaUtils/compare";
import _ from 'lodash'
import withStyles from "@material-ui/core/styles/withStyles";
import produce from "immer";

import './EntityListView.scss'

const iconStyle = {fontSize: 18};

export const TickCheckbox = ({...props}) => <Checkbox
    icon={<CheckIcon style={{...iconStyle, color: '#666666'}}/>}
    checkedIcon={<CheckIcon style={{...iconStyle, color: '#C71784'}}/>}
    {...props}
/>;

export const RoundCheckbox = ({...props}) => <Checkbox
    icon={<UncheckedCircle style={{...iconStyle, color: '#666666'}}/>}
    checkedIcon={<CheckedCircle style={{...iconStyle, color: '#C71784'}}/>}
    {...props}
/>;

export const PinkCheckbox = withStyles({
    root: {
        '&$checked': {
            color: '#C71784'
        },
    },
    checked: {},
    icon: {
        borderRadius: 3,
        width: 14,
        height: 14,
        margin: 3,
        border: ' 2px solid rgb(87,87,87)',
        backgroundColor: '#f5f8fa',
        backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
        '$root.Mui-focusVisible &': {
            outline: '2px auto rgba(19,124,189,.6)',
            outlineOffset: 2,
        },
        'input:hover ~ &': {
            backgroundColor: '#ebf1f5',
        },
        'input:disabled ~ &': {
            boxShadow: 'none',
            background: 'rgba(206,217,224,.5)',
        },
    }
})((props) => <Checkbox
    icon={<span className={props.classes.icon}/>}
    checkedIcon={<CheckBox style={{fontSize: 20, color: '#C71784'}}/>}
    {...produce(props, props => {delete props.classes.icon})} />);

export const useChecked = (inputItems) => {
    const [items, setItems] = useState([]);
    const previousItems = usePrevious(inputItems)

    useEffect(() => {//if items get added or removed, update. This behavior is simplified for current use cases
        if (inputItems.length !== _.get(previousItems, 'length', 0)) setItems(inputItems.map(instance => ({
            ...instance,
            checked: (instance.checked || false)
        })))
    }, [inputItems])

    const handleCheck = (checkedInstance) => setItems(instances =>
        instances.map(instance => instance === checkedInstance ? {
            ...checkedInstance,
            checked: !checkedInstance.checked
        } : instance)
    );

    const allChecked = items.every(i => i.checked);

    const handleAllCheck = () => setItems(instances => instances.map(instance => ({
            ...instance,
            checked: !allChecked
        }))
    );

    const resetChecked = (newInstances) => {
        setItems(oldInstances => (newInstances || oldInstances).map(instance => ({
                ...instance,
                checked: false
            }))
        );
    }

    return {allChecked, handleCheck, handleAllCheck, items, resetChecked}

}

export const sortEntities = (entitySingular) =>{
    const ASCENDING_ORDER = 'asc';
    const DESCENDING_ORDER = 'desc';
    const ENTITY_LIST_SORT_PREFERENCE = 'entityListSortPreference';

    const sessionPreference = sessionStorage.getItem(ENTITY_LIST_SORT_PREFERENCE + entitySingular);
    const sortPreference = sessionPreference ? JSON.parse(sessionPreference) : {property: 'Entity Name', valueAccessor: 'Entity Name', order: ASCENDING_ORDER};      

    const [currentSort, setSort] = useState(sortPreference);
    
    const sortEntitiesBy = (colAccessor) => {
        let order = currentSort.property == colAccessor ? currentSort.order == ASCENDING_ORDER ? DESCENDING_ORDER : ASCENDING_ORDER : ASCENDING_ORDER;
        //TODO: we might need a better condition than to check if the column accessor has a . in it. This condition will hold for all properties however.
        const sortValue = {valueAccessor: !colAccessor.includes('.') || colAccessor.includes('.val') ? colAccessor : colAccessor + '.val', property: colAccessor, order: order};
        setSort(sortValue);
        sessionStorage.setItem(ENTITY_LIST_SORT_PREFERENCE + entitySingular, JSON.stringify(sortValue));
    }

    return {sortEntitiesBy, currentSort}
}

export const EntityListView = ({config, entities, onDetail, actions, context, entityPlural = 'Entities', entitySingular = 'Entity'}) => {

    const {allChecked, handleCheck, handleAllCheck, items: entityInstances} = useChecked(entities);
    const {sortEntitiesBy, currentSort: currentSort} = sortEntities(entitySingular);
    
    const buildCell = instance => (col, i) => {
        const value = _.get(instance, col.accessor);
        const first = i === 0;
        return <div key={i} className={clsx({
            'content-column': true,
            ' first': first
        })}
                    {...(first && {onClick: () => onDetail(instance)})}>
            {value && typeof value === 'string' ? value : value ? value.val : null}
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
        <div
            className='entity-list-view-count'>{`Showing ${entities.length} ${entities.length > 1 ? entityPlural : entitySingular}`}</div>
        <div className='header-row'>
            {config.multiselect && <div className='header-column checkbox'>
                <RoundCheckbox checked={allChecked} onChange={handleAllCheck}/>
            </div>}
            {config.columns.map(col => <div key={col.name} onClick={() => sortEntitiesBy(col.accessor)} className='header-column'>{col.name} {col.accessor == currentSort.property && <i className={currentSort.order == 'asc' ? "fas fa-angle-double-up" : "fas fa-angle-double-down"}></i>}</div>)}
        </div>
        {_.orderBy(entityInstances, currentSort.valueAccessor, currentSort.order).map(instance =>
            <div key={instance._id} className='content-row'>
                {config.multiselect && <div className='content-column checkbox'>
                    <RoundCheckbox checked={instance.checked} onChange={() => handleCheck(instance)}/>
                </div>}
                {config.columns.map(buildCell(instance))}
            </div>)
        }
    </div>
}

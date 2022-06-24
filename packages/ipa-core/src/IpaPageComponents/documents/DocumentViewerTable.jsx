import React from "react";
import {ASCENDING_ORDER, DESCENDING_ORDER} from "../entities/sortEntities";
import produce from "immer";
import {EntityTableContainer} from "../entities/EntityTableContainer";

const withDocumentsAsTable = ({tableConfig, documents, actions, documentsDataIdAccessor}) => {

    const convertedColumns = tableConfig.columns.map(c=>{
        if(typeof c ==='string'){
            return {
                name : c,
                valueAccessor: c
            }
        }
        return c;
    });

    const tableViewConfig = {
        //properties from config that existing table components were already using
        name: "EntityTableContainer",
        className: "entity-list-view-default",
        multiselect: true,
        lastColumnSticky : true,
        columns: convertedColumns,
        //documents config that needs to be converted, so existing code can be reused
        initialSort : {
            property: convertedColumns.find(c=>c.name==tableConfig.sort.currentColumn).name || 'Entity Name',
            valueAccessor: convertedColumns.find(c=>c.name==tableConfig.sort.currentColumn).valueAccessor || 'Entity Name',
            order: tableConfig.isDescending ? DESCENDING_ORDER : ASCENDING_ORDER
        },
        //not yet implemented
        lockedColumns : tableConfig.lockedColumns,
        onColumnsChange : tableConfig.onColumnsChange,
    };

    //convert actions to bulk actions
    const convertedActions = actions.filter(a=>a.bulk).map(a=>{
        let convertedAction = {};
        convertedAction.name = a.name;
        convertedAction.key = a.key;
        convertedAction.showOnTable = !a.bulk.hidden;
        let props = {};
        if(a.bulk.props){
            props = {...props,...a.bulk.props};
        }
        const ActionIconRenderer = a.bulk.component;
        convertedAction.iconRenderer = <ActionIconRenderer {...props}></ActionIconRenderer>;
        convertedAction.disabled = a.bulk.disabled;
        convertedAction.hidden = a.bulk.hidden;
        if(a.single){
            convertedAction.showOnRowCell = !a.single.hidden;
        }
        return convertedAction;
    }).reduce((acc,a)=>({...acc,[a.key] : a}));

    const convertedRowActions = actions.filter(a=>a.single).map(a=>{
        let convertedAction = {};
        convertedAction.name = a.name;
        convertedAction.key = a.key;
        convertedAction.showOnTable = !a.single.hidden;
        let props = {};
        if(a.bulk.props){
            props = {...props,...a.bulk.props};
        }
        const ActionIconRenderer = a.bulk.component;
        convertedAction.iconRenderer = <ActionIconRenderer {...props}></ActionIconRenderer>;
        convertedAction.disabled = a.bulk.disabled;
        convertedAction.hidden = a.bulk.hidden;
        return convertedAction;
    }).reduce((acc,a)=>({...acc,[a.key] : a}));

    const convertedRowActionsPerEntity = {};

    documents.forEach(d=>{
        if(!d.actions){
            return;
        }
        const actions = d.actions;
        actions.map(a=>{
            let convertedAction = {};
            convertedAction.name = a.name;
            convertedAction.key = a.key;
            convertedAction.showOnRowCell = !a.hidden;
            let props = {};
            if(a.props){
                props = {...props,...a.props};
            }
            const ActionIconRenderer = a.bulk.component;
            convertedAction.iconRenderer = <ActionIconRenderer {...props}></ActionIconRenderer>;
            convertedAction.disabled = a.bulk.disabled;
            convertedAction.hidden = a.bulk.hidden;
            return convertedAction;
        }).reduce((acc,a)=>({...acc,[a.key] : a}));
    });


    //TODO: versions


    return <EntityTableContainer
        config={tableViewConfig}
        onDetail={this.openDetail}
        entities={documents}
        actions={convertedActions}
        context={{}}
        entityPlural={'Documents'}
        entitySingular={'Document'}

    />

}
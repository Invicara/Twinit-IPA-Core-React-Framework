import React, {useEffect, useState} from "react";
import {compose} from "redux";
import {withAppContext} from "../../AppProvider";
import withGenericPage from "../GenericPage";
import {connect} from "react-redux";
import {StackableDrawer} from "../controls/StackableDrawer";
import {ScriptedOptionsSelect} from "../controls/ScriptedOptionsSelect";
import {
    getEntities,
    getFilters,
    getGroups,
    setEntities,
    setFilters,
    setGroups
} from "../../redux/slices/system-builder";
import {EntityGroupAndFilterTree} from "./EntityGroupAndFilterTree";
import {RoundCheckbox, SquareInSquareCheckbox, TickCheckbox} from "../entities/EntityListView";
import {Star} from "../files/misc";
import _ from "lodash";
import {getValue} from "../files/FilesTable";
import Checkbox from "@material-ui/core/Checkbox";
import clsx from "clsx";

const defColumns = [
    {
        "name": "Name",
        "accessor": "Entity Name"
    },
    {
        "name": "Mark",
        "accessor": "properties.Mark"
    },
    {
        "name": "Room",
        "accessor": "properties.Room"
    }
]

export const EntityDetailTable = ({columns = defColumns, entities, allChecked, onCheck, onAllCheck}) => {

    return !_.isEmpty(entities) && <table className="entity-table">
        <thead>
        <tr className="entity-table-header">
            <th className="short">
                <SquareInSquareCheckbox checked={allChecked} onChange={onAllCheck}/>
            </th>
            {columns.map(col => <th key={col.name}>{col.name}</th>)}
        </tr>
        </thead>
        <tbody>
        {entities.map((entity, i) => <tr key={i} className={clsx("entity-table-body", i % 2 ? 'even' : 'odd')}>
            <td className="short">
                <SquareInSquareCheckbox checked={entity.checked} onChange={() => onCheck(entity)}/>
            </td>
            {columns.map(col =>{
                const value = _.get(entity, col.accessor);
                return <td key={col.name}>{typeof value === 'object' ? value.val: value}</td>
            })}
        </tr>)}
        </tbody>
    </table>
}

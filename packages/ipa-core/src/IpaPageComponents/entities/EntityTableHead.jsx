import React, {useState, useMemo, useEffect, useCallback} from "react";
import clsx from "clsx";
import EntityActionsPanel from "./EntityActionsPanel";
import _ from 'lodash'

import './EntityListView.scss'
import {RoundCheckbox, useChecked} from "../../IpaControls/Checkboxes";
import {isValidUrl} from '../../IpaUtils/helpers'
import {Box, TableCell, TableHead, TableRow, TableSortLabel} from "@material-ui/core";
//import { visuallyHidden } from '@material-ui/utils';

const visuallyHidden = {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: '1px',
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px',
}

export const EntityTableHead = ({allChecked, handleAllCheck, columns, multiselect, lastColumnSticky, currentSort, sortEntitiesBy }) => {

    const handleColumnClick = (col) => _.noop();

    const toggleSort = (col) => () => sortEntitiesBy(col.accessor);

    const cells = useMemo(()=>columns.map((col,i) => {
        const first = i === 0;
        const lastColumn = i === columns.length-1;
        return <TableCell
        key={col.name}
        onClick={handleColumnClick}
        className='header-column'
        className={clsx({
            'header-column': true,
            ' first' : first,
            ' sticky': first,
            ' sticky sticky-end': lastColumn && lastColumnSticky
        })}
        //align={col.numeric ? 'right' : 'left'}
        padding={'none'}
        sortDirection={col.accessor == currentSort.property ? currentSort.order : false}
    >
            {col.accessor && <TableSortLabel
            active={col.accessor == currentSort.property}
            direction={col.accessor == currentSort.property ? currentSort.order  : 'asc'}
            onClick={toggleSort(col)}
            sx={{display:'flex'}}
        >
            <Box component="div" sx={{flexGrow: 1}}>
                {col.name}
            </Box>
        </TableSortLabel>}
    </TableCell>}),[lastColumnSticky,sortEntitiesBy,currentSort]);

    return <TableHead className='header-row'>
        <TableRow>
        {multiselect && <TableCell padding="checkbox" className='header-column checkbox sticky'>
            <RoundCheckbox checked={allChecked} onChange={handleAllCheck}/>
        </TableCell>}
        {cells}
        </TableRow>
    </TableHead>;
}




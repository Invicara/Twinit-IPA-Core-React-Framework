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

export const EntityListViewTableHead = ( {allChecked, handleAllCheck, config, currentSort, sortEntitiesBy }) => {

    const handleColumnClick = (col) => _.noop();

    const toggleSort = (col) => () => sortEntitiesBy(col.accessor);

    const cells = useMemo(()=>config.columns.map((col,i) => {
        const first = i === 0;
        return <TableCell
        key={col.name}
        onClick={handleColumnClick}
        className='header-column'
        className={clsx({
            'header-column': true,
            ' sticky': first
        })}
        //align={col.numeric ? 'right' : 'left'}
        padding={'none'}
        sortDirection={col.accessor == currentSort.property ? currentSort.order : false}
    >
        <TableSortLabel
            active={col.accessor == currentSort.property}
            direction={col.accessor == currentSort.property ? currentSort.order  : 'asc'}
            onClick={toggleSort(col)}
            sx={{display:'flex'}}
        >
            <Box component="div" sx={{flexGrow: 1}}>
                {col.name}
            </Box>
        </TableSortLabel>
    </TableCell>}),[config,sortEntitiesBy,currentSort]);

    return <TableHead className='header-row'>
        <TableRow>
        {config.multiselect && <TableCell padding="checkbox" className='header-column checkbox sticky'>
            <RoundCheckbox checked={allChecked} onChange={handleAllCheck}/>
        </TableCell>}
        {cells}
        </TableRow>
    </TableHead>;
}




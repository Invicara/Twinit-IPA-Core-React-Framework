import React, {useMemo} from "react";
import clsx from "clsx";
import _ from 'lodash'

import './EntityListView.scss'
import {RoundCheckbox} from "../../IpaControls/Checkboxes";
import {Box, TableCell, TableHead, TableRow, TableSortLabel} from "@material-ui/core";

export const EntityTableHead = ({allChecked, handleAllCheck, columns, multiselect, lastColumnSticky, currentSort, sortEntitiesBy }) => {

    const handleColumnClick = (col) => _.noop();

    const toggleSort = (col) => () => sortEntitiesBy(col.accessor);

    const cells = useMemo(()=>columns.map((col,i) => {
        const first = i === 0;
        const lastColumn = i === columns.length-1;
        return <TableCell
        key={col.name}
        onClick={handleColumnClick}
        // className='header-column'
        className={clsx({
            'header-column': true,
            ' first' : first,
            ' sticky': first,
            ' sticky sticky-end': lastColumn && lastColumnSticky
        })}
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




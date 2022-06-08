import React, {useState, useMemo, useEffect, useCallback} from "react";
import clsx from "clsx";
import EntityActionsPanel from "./EntityActionsPanel";
import _ from 'lodash'

import './EntityListView.scss'
import {RoundCheckbox, useChecked} from "../../IpaControls/Checkboxes";
import {isValidUrl} from '../../IpaUtils/helpers'
import {
    Box, Table, TableBody,
    TableCell,
    TableContainer,
    TableHead, TablePagination,
    TableRow,
    TableSortLabel,
    Toolbar,
    Typography
} from "@material-ui/core";
import useSortEntities from "./sortEntities";
import {EntityListViewTableHead} from "./EntityListViewTableHead";
//import { visuallyHidden } from '@material-ui/utils';
import PropTypes from 'prop-types';

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

const EntityListTableToolbar = (props) => {
    const { numSelected, entityPlural, entitySingular } = props;

    return (
        <React.Fragment>
        <Toolbar disableGutters={true} variant="dense">
            {numSelected > 0 ? (
                <Typography variant="overline" display="block" gutterBottom
                >{`Showing ${numSelected} ${numSelected > 1 ? entityPlural : entitySingular}`}
                </Typography>
            ) : null}
        </Toolbar>
        </React.Fragment>
    );
};

EntityListTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
    entityPlural: PropTypes.string.isRequired,
    entitySingular: PropTypes.string.isRequired,
};

export const EntityListViewTableContainer = ({config, entities, onDetail, actions, context, onChange, onSortChange, selectedEntities, entityPlural = 'Entities', entitySingular = 'Entity'}) => {

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

    const buildTableCell = useCallback((instance) => (col, i) => {
        const value = _.get(instance, col.accessor);
        let dispValue = value && typeof value === 'string' ? value : value ? value.val : null
        dispValue = isValidUrl(dispValue) ? <a href={dispValue} target="_blank">{dispValue}</a> : dispValue

        const first = i === 0;

        return <TableCell className={clsx({
                'content-column': true,
                ' first': first,
                ' sticky': first
            })}
            {...(first && {onClick: () => onDetail(instance)})}
            component="td"
            id={i}
            scope="row"
            padding="none"
        >
                {dispValue}
        </TableCell>;
    },[onDetail]);

    const entityType = useMemo(()=> {return {
        singular: entitySingular,
        plural: entityPlural
    }},[entitySingular,entityPlural]);

    const [dense, setDense] = useState(false);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(config.numRows || 200);

    const handleChangePage = (event, newPage) => {
        //setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangeDense = (event) => {
        //setDense(event.target.checked);
    };

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - entities.length) : 0;


    return <div className={`entity-list-view-root ${config.className}`}>
        {actions && <div className='actions-panel'>
            <EntityActionsPanel
                actions={actions}
                entity={entityInstances.filter(inst => inst.checked)}
                type={entityType}
                context={context}
            />
        </div>}
        <div className='entity-list-view-count-toolbar'>
            <EntityListTableToolbar numSelected={entities.length} entitySingular={entitySingular} entityPlural={entityPlural}></EntityListTableToolbar>
        </div>
        <TableContainer>
            <Table
                sx={{ minWidth: 750 }}
                aria-labelledby="tableTitle"
                size={dense ? 'small' : 'medium'}
            >
                <EntityListViewTableHead
                    allChecked={allChecked}
                    handleAllCheck={handleAllCheck}
                    config={config}
                    currentSort={currentSort}
                    sortEntitiesBy={sortEntitiesBy}
                />
                <TableBody>
                    {_.orderBy(entityInstances, currentSort.valueAccessor, currentSort.order)
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((instance, index) => {
                            const isItemSelected = instance.checked;
                            const handleChange = () => handleCheck(instance)
                            return (
                                <TableRow
                                    hover
                                    onClick={(event) => _.noop(event, instance)}
                                    role="checkbox"
                                    aria-checked={isItemSelected}
                                    tabIndex={-1}
                                    key={instance._id}
                                    selected={isItemSelected}
                                    className="content-row"
                                >
                                    {config.multiselect && <TableCell padding="checkbox" className="sticky">
                                        <RoundCheckbox checked={instance.checked} onChange={handleChange}/>
                                    </TableCell>}
                                    {config.columns.map(buildTableCell(instance))}
                                </TableRow>
                            );
                        })
                    }
                    {emptyRows > 0 && (
                        <TableRow
                            style={{
                                height: (dense ? 33 : 53) * emptyRows,
                            }}
                        >
                            <TableCell colSpan={1+config.columns.length} />
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
        <TablePagination
            rowsPerPageOptions={[5, 50, 100, 200]}
            component="div"
            count={entities.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
        />
    </div>
}




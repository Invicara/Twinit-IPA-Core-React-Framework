import React, { useMemo, useEffect, useCallback, useRef } from "react";
import clsx from "clsx";
import EntityActionsPanel from "./EntityActionsPanel";
import _ from "lodash";

import "./EntityTable.scss";
import { RoundCheckbox, useChecked } from "../../IpaControls/Checkboxes";
import { isValidUrl } from "../../IpaUtils/helpers";
import {
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Toolbar,
  Typography,
} from "@material-ui/core";
import useSortEntities, { usePaginateEntities } from "./sortEntities";
import { EntityTableHead } from "./EntityTableHead";
import PropTypes from "prop-types";
import produce from "immer";

const EntityTableToolbar = (props) => {
  const { numSelected, entityPlural, entitySingular } = props;

  return (
    <React.Fragment>
      <Toolbar disableGutters={true} variant="dense">
        {numSelected > 0 ? (
          <Typography variant="overline" display="block" gutterBottom>
            {`Showing ${numSelected} ${numSelected > 1 ? entityPlural : entitySingular}`}
          </Typography>
        ) : null}
      </Toolbar>
    </React.Fragment>
  );
};

EntityTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  entityPlural: PropTypes.string.isRequired,
  entitySingular: PropTypes.string.isRequired,
};

const EntityTableActionsCell = (props) => {
  const { actions, entity, entityType, context } = props;

  const rowCellActions = useMemo(
    () =>
      Object.entries(actions)
        .filter(([key, a]) => a.showOnRowCell)
        .reduce(function (acc, [key, val], i) {
          acc[key] = val;
          return acc;
        }, {}),
    [actions],
  );

  return (
    <EntityActionsPanel
      actions={rowCellActions}
      entity={entity}
      type={entityType}
      context={context}
    />
  );
};

const EntityTableVersionsCell = ({
  actions,
  entity,
  versions,
  accessors,
  entityType,
  context,
  onSelectedVersionChanged,
}) => {
  const { currentVersionAccessor = "_tipVersion" } = accessors || {};

  const rowCellActions = useMemo(
    () =>
      Object.entries(actions)
        .filter(([key, a]) => a.showOnRowCell)
        .reduce(function (acc, [key, val], i) {
          acc[key] = val;
          return acc;
        }, {}),
    [actions],
  );

  const handleChange = (event) => {
    onSelectedVersionChanged(event.target.value, entity, versions);
  };

  return (
    <>
      <InputLabel id="demo-simple-select-standard-label">Version</InputLabel>
      <Select
        labelId="demo-simple-select-standard-label"
        id="demo-simple-select-standard"
        value={age}
        onChange={handleChange}
        label="Age"
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value={10}>Ten</MenuItem>
        <MenuItem value={20}>Twenty</MenuItem>
        <MenuItem value={30}>Thirty</MenuItem>
      </Select>
    </>
  );
};

export const EntityTableContainer = ({
  config,
  actions,
  rowActions,
  context,
  entities,
  selectedEntities,
  entityPlural = "Entities",
  entitySingular = "Entity",
  initialSort,
  dense = "false",
  onDetail,
  onChange,
  onSortChange,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const tableRef = useRef();

  let checkableEntities = useMemo(
    () =>
      entities.map((entity) => {
        let checked =
          !_.isEmpty(selectedEntities) &&
          selectedEntities.findIndex(
            (selectedEntity) => entity._id === selectedEntity._id,
          ) !== -1;
        return { ...entity, checked };
      }),
    [entities, selectedEntities],
  );

  const checkCallback = useCallback(
    (entity) => {
      let newEntities = checkableEntities.map((e) => {
        return e._id === entity._id ? { ...e, checked: !entity.checked } : e;
      });
      onChange?.(newEntities);
    },
    [entities, selectedEntities],
  );

  const isAllChecked = checkableEntities.every((e) => e.checked);

  const allCheckCallback = useCallback(() => {
    let newEntities = entities.map((e) => ({ ...e, checked: !isAllChecked }));
    onChange?.(newEntities);
  }, [entities, selectedEntities]);

  //If the selectedEntities props is used, we assume a controlled behaviour, uncontrolled otherwise
  let allChecked, handleCheck, handleAllCheck, entityInstances;
  if (selectedEntities) {
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
  const { sortEntitiesBy, currentSort: currentSort } = useSortEntities(
    entitySingular,
    onSortChange,
    initialSort,
  );

  const entityType = useMemo(() => {
    return {
      singular: entitySingular,
      plural: entityPlural,
    };
  }, [entitySingular, entityPlural]);

  const columns = useMemo(
    () =>
      produce(config.columns, (columns) => {
        const rowCellActions = Object.entries(actions).filter(
          ([key, a]) => a.showOnRowCell,
        );
        if (rowCellActions.length > 0) {
          columns.push({
            name: "_row_actions",
            //"accessor" : "",
            type: "actions",
          });
        }
      }),
    [config.columns, actions],
  );

  const rowCellActions = useMemo(() => {
    const rowActionsMap = Object.entries(actions)
      .filter(([key, a]) => a.showOnRowCell)
      .reduce(
        (map, arrayOfKeyValue) => ({
          ...map,
          [arrayOfKeyValue[0]]: { ...arrayOfKeyValue[1] },
        }),
        {},
      );
    return produce(rowActionsMap, (map) => {
      Object.entries(map).forEach(([key, a]) => {
        a.icon = a.icon + " inv-icon__masked";
      });
    });
  }, [actions]);

  const buildTableCell = useCallback(
    (instance) => (col, i) => {
      const value = _.get(instance, col.accessor);
      let dispValue =
        value && typeof value === "string" ? value : value ? value.val : null;
      dispValue = isValidUrl(dispValue) ? (
        <a href={dispValue} target="_blank">
          {dispValue}
        </a>
      ) : (
        dispValue
      );

      const first = i === 0;
      const lastColumn = i === columns.length - 1;

      return (
        <TableCell
          className={clsx({
            "content-column": true,
            "entity-actions-cell": col.type == "actions",
            " first": first,
            " sticky": first,
            " sticky sticky-end": lastColumn && config.lastColumnSticky,
          })}
          {...(first && { onClick: () => onDetail?.(instance) })}
          component="td"
          id={i}
          scope="row"
          padding="none"
          key={i + 1}
        >
          <div className="text-nowrap text-truncate">
            {col.type == "actions" ? (
              <EntityTableActionsCell
                actions={rowCellActions}
                entity={[instance]}
                entityType={entityType}
                context={context}
              />
            ) : (
              <span>{dispValue}</span>
            )}
          </div>
        </TableCell>
      );
    },
    [onDetail, entityType, context, actions],
  );

  const initialPagination = {
    offset: 0,
    pageSize: config.numRows || 200,
    total: entities.length,
  };

  const { paginateTableBy, page, rowsPerPage, count } = usePaginateEntities(
    initialPagination,
    onPageChange,
    onRowsPerPageChange,
  );

  const generateStickyColumnRecalculationFn = (wait) => {
    const sumPreviousSiblingsWidth = (elem) => {
      let sum = elem.getBoundingClientRect().width;
      if (elem.previousElementSibling) {
        sum += sumPreviousSiblingsWidth(elem.previousElementSibling);
      }
      return sum;
    };
    const calculateStickyColumnPositions = () => {
      if (!tableRef.current) {
        return;
      }
      console.log("recalculating left positions");
      const selectedNodes = tableRef.current.querySelectorAll(
        "thead tr th.sticky:not(.sticky-end), tbody tr td.sticky:not(.sticky-end)",
      );
      Array.from(selectedNodes).forEach((s) => {
        let left = 0;
        if (s.previousElementSibling) {
          left = sumPreviousSiblingsWidth(s.previousElementSibling);
        }
        s.style.left = left + "px";
      });
    };
    return _.debounce(calculateStickyColumnPositions, wait || 100);
  };

  useEffect(() => {
    //apply left style to sticky columns on CELLS RENDER (including pagination and sorting updates)
    //update sticky positions instantly
    const updateStickyCells = generateStickyColumnRecalculationFn(0);
    updateStickyCells();
    return () => {
      updateStickyCells.cancel();
    };
  }, [page, rowsPerPage, count, currentSort]);

  useEffect(() => {
    //apply left style to sticky columns on RESIZE EVENT
    //on resize use longer debounce
    const onEachResize = generateStickyColumnRecalculationFn(1000);
    window.addEventListener("resize", onEachResize);
    return () => {
      window.removeEventListener("resize", onEachResize);
      onEachResize.cancel();
    };
  }, []);

  const handleChangePage = (event, newPage) => {
    paginateTableBy({ offset: newPage * rowsPerPage });
  };

  const handleChangeRowsPerPage = (event) => {
    paginateTableBy({ pageSize: parseInt(event.target.value, 10) });
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = rowsPerPage - (count % rowsPerPage);
  const isLastPage = Math.ceil(count / rowsPerPage) - 1 == page;

  const actionableEntities = useMemo(
    () => entityInstances.filter((inst) => inst.checked),
    [entityInstances],
  );

  return (
    <div className={`entity-table-root ${config.className}`}>
      {actions && (
        <div className="actions-panel">
          <EntityActionsPanel
            actions={actions}
            entity={actionableEntities}
            type={entityType}
            context={context}
          />
        </div>
      )}
      <div className="entity-table__count-toolbar">
        <EntityTableToolbar
          numSelected={entities.length}
          entitySingular={entitySingular}
          entityPlural={entityPlural}
        ></EntityTableToolbar>
      </div>
      <TableContainer>
        <Table
          ref={tableRef}
          sx={{ minWidth: 280 }}
          aria-labelledby="tableTitle"
          size={dense ? "small" : "medium"}
          className={"entity-table"}
        >
          <EntityTableHead
            allChecked={allChecked}
            handleAllCheck={handleAllCheck}
            lastColumnSticky={config.lastColumnSticky}
            multiselect={config.multiselect}
            columns={columns}
            currentSort={currentSort}
            sortEntitiesBy={sortEntitiesBy}
          />
          <TableBody>
            {_.orderBy(
              entityInstances,
              currentSort.valueAccessor,
              currentSort.order,
            )
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((instance, index) => {
                const isItemSelected = instance.checked;
                const handleChange = () => handleCheck(instance);
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
                    {config.multiselect && (
                      <TableCell
                        padding="checkbox"
                        className="content-column checkbox"
                        key={0}
                      >
                        <RoundCheckbox
                          checked={instance.checked}
                          onChange={handleChange}
                        />
                      </TableCell>
                    )}
                    {columns.map(buildTableCell(instance, config))}
                  </TableRow>
                );
              })}
            {isLastPage > 0 && page > 0 && (
              <TableRow
                style={{
                  height: (dense ? 31 : 41) * emptyRows,
                }}
              >
                <TableCell colSpan={1 + columns.length} />
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
        labelRowsPerPage=""
      />
    </div>
  );
};

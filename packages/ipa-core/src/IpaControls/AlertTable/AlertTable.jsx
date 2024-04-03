import React, { useState } from "react";
import Table from "../Table/Table";
import BaseTextInput from "../BaseTextInput";
import "./AlertTable.scss";
import { Tooltip } from "@material-ui/core";
import { withGenericPageContext } from "../../IpaPageComponents/genericPageContext";
import ScriptHelper from "../../IpaUtils/ScriptHelper";

const getHeaders = (columns) => {
  let headers = columns.filter((c) => c.active === true).map((c) => c.name);
  headers.push("");
  headers.splice(1, 0, "");
  return headers;
};

const URGENCY_CLASSNAMES = {
  High: "cell--urgency cell--urgency-high",
  Medium: "cell--urgency cell--urgency-medium",
  Low: "cell--urgency cell--urgency-low",
};

const inactivateAlert = (alert, setAcknowledgedAlert, scriptName) => {
  const result = alert;
  result.properties.Acknowledged.val = true;
  setAcknowledgedAlert(true);
  return ScriptHelper.executeScript(scriptName, { data: result });
};

const getRowFromAlert = (
  alert,
  activeColumns,
  navigationConfig,
  onNavigate,
  setAcknowledgedAlert,
  scriptName,
) => {
  const row = activeColumns.map((c) => {
    let className = undefined;
    let property = _.get(alert, c.accessor);
    if (property?.dname === "Urgency") {
      className = URGENCY_CLASSNAMES[property.val];
    }
    return { ..._.get(alert, c.accessor), className };
  });

  row.unshift({
    type: "action",
    val: alert.properties.Acknowledged.val ? (
      <Tooltip
        key="cell-tooltip"
        title="Alert has been acknowledged"
        enterDelay={500}
      >
        <button className="alert-table__row-action-button">
          <i
            className="fa fa-check"
            style={{ color: "#1A8817" }}
            aria-hidden="true"
          ></i>
        </button>
      </Tooltip>
    ) : (
      <Tooltip key="cell-tooltip" title="Inactivate alert" enterDelay={500}>
        <button
          className="alert-table__row-action-button"
          onClick={() => {
            inactivateAlert(alert, setAcknowledgedAlert, scriptName);
          }}
        >
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
      </Tooltip>
    ),
    className: "alert-table__row-action",
  });

  //TODO create and push the action menu
  row.push({
    type: "action",
    val: (
      <Tooltip key="cell-tooltip" title="Navigate to Source" enterDelay={500}>
        <button
          className="alert-table__row-action-button"
          onClick={() => {
            console.log("button onClick alert", alert);
            console.log("button onClick navigationConfig", navigationConfig);
            if (alert.Source !== null) {
              const entityType = alert.Source.entityType;
              const selectedEntities = alert.Source.entities.map((e) => e._id);

              let selectionInfo = {
                entityType,
                selectedEntities,
                senderEntityType: entityType,
                queryParams: {
                  query: { value: selectedEntities },
                },
              };
              console.log("button onClick selectionInfo", selectionInfo);
              onNavigate(navigationConfig[entityType], selectionInfo);
            }
          }}
        >
          <i className="fa fa-arrow-right" aria-hidden="true"></i>
        </button>
      </Tooltip>
    ),
    className: "alert-table__row-action",
  });

  return row;
};

const getRowsFromAlerts = (
  alerts,
  columns,
  navigationConfig,
  onNavigate,
  setAcknowledgedAlert,
  scriptName,
) => {
  let activeColumns = columns.filter((c) => c.active === true);

  let rows = alerts.map((a) =>
    getRowFromAlert(
      a,
      activeColumns,
      navigationConfig,
      onNavigate,
      setAcknowledgedAlert,
      scriptName,
    ),
  );
  return rows;
};

const AlertTable = (props) => {
  const [filterInput, setFilterInput] = useState(null);

  return (
    <div className="alert-table">
      <h1 className="alert-table__title">{props.title}</h1>
      <div className="alert-table__body">
        <div className="alert-table__filter">
          <label className="alert-table__filter-label">Filter By: </label>
          <BaseTextInput
            className="alert-table__filter-input"
            inputProps={{
              disabled: true,
              type: "text",
              value: filterInput,
              onChange: (e) => setFilterInput(e.target.value),
            }}
          />
          <button
            disabled={true}
            className={`alert-table__filter-button alert-table__filter-button--disabled `}
          >
            <i className="fa fa-sliders"></i>
          </button>
        </div>
        <Table
          className="alert-table__table"
          headers={getHeaders(props.columns)}
          rows={getRowsFromAlerts(
            props.alerts,
            props.columns,
            props.navigateTo,
            props.onNavigate,
            props.setAcknowledgedAlert,
            props.scriptName,
          )}
          options={{
            emptyMessage: "No data",
            emptyMessageClassName: "alert-table__empty-message",
          }}
        />
      </div>
    </div>
  );
};

export default withGenericPageContext(AlertTable);

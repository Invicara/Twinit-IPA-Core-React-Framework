import React, { useState } from "react";
import Table from "../Table/Table.jsx";
import { Tooltip } from "@material-ui/core";
import ScriptHelper from "../../IpaUtils/ScriptHelper";
import BaseTextInput from "../BaseTextInput";
import "./AlertTable.scss";

const URGENCY_CLASSNAMES = {
  High: "cell--urgency cell--urgency-high",
  Medium: "cell--urgency cell--urgency-medium",
  Low: "cell--urgency cell--urgency-low",
};

export const getHeaders = (columns) => {
  let headers = columns.filter((c) => c.active === true).map((c) => c.name);
  headers.push("");
  headers.splice(1, 0, "");
  return headers;
};

export const inactivateAlert = (alert, acknowledgedAlert, setAcknowledgedAlert, scriptName) => {
  const alertCopy = alert;
  alertCopy.properties.Acknowledged.val = true;
  acknowledgAlert(alertCopy, acknowledgedAlert, setAcknowledgedAlert, scriptName)
  return alertCopy
};

const acknowledgAlert = (alertCopy, acknowledgedAlert, setAcknowledgedAlert, scriptName) => {
  setAcknowledgedAlert(!acknowledgedAlert);
  return ScriptHelper.executeScript(scriptName, { data: alertCopy });
}

const getRowFromAlert = (alert, activeColumns, navigationConfig, onNavigate, acknowledgedAlert, setAcknowledgedAlert, scriptName) => {
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
            inactivateAlert(alert, acknowledgedAlert, setAcknowledgedAlert, scriptName);
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
          data-testid="navigate-button"
          onClick={() => {
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

export const getRowsFromAlerts = (alerts, columns, navigationConfig, onNavigate, acknowledgedAlert, setAcknowledgedAlert, scriptName) => {
  let activeColumns = columns.filter((c) => c.active === true);

  let rows = alerts.map((a) => getRowFromAlert(a, activeColumns, navigationConfig, onNavigate, acknowledgedAlert, setAcknowledgedAlert, scriptName));
  return rows;
};

export const AlertTable = ({title, alerts, columns, navigateTo, onNavigate, scriptName}) => {
  const [filterInput, setFilterInput] = useState(undefined);
  const [acknowledgedAlert, setAcknowledgedAlert] = useState(false)

  return (
    <div className="alert-table">
      <h1 className="alert-table__title">{title}</h1>
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
          headers={getHeaders(columns)}
          rows={getRowsFromAlerts(
            alerts,
            columns,
            navigateTo,
            onNavigate,
            acknowledgedAlert,
            setAcknowledgedAlert,
            scriptName,
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

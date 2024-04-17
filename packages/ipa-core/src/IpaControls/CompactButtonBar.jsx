import React from "react";
import PropTypes from "prop-types";
import "./CompactButtonBar.scss";

const CompactButtonBar = (props) => {
  let orientation = props.orientation || "horizontal";

  let barClass =
    orientation == "horizontal"
      ? "compact-button-bar horizontal"
      : "compact-button-bar";
  let btnClass =
    orientation == "horizontal"
      ? "compact-button-bar-button horizontal"
      : "compact-button-bar-button";

  const doAction = (key) => {
    props.dashboard.doAction(props.actions[key]);
  };

  let buttons = Object.entries(props.actions).map(([key, a]) => (
    <div key={key} className={btnClass} onClick={(e) => doAction(key)}>
      <div className="compact-button-bar-image">
        <img
          src={
            (props?.dashboard?.props?.selectedItems?.ipaConfig
              ?.referenceAppConfig?.refApp
              ? "/reference/"
              : "/") + a.icon
          }
        />
      </div>
      <div className="compact-button-bar-button-text-container">
        <div style={props?.titleStyle}>
          <h1>{a.title}</h1>
        </div>
        <div className="compact-button-text">{a.text}</div>
      </div>
    </div>
  ));

  let barStyle = {};
  return (
    <div className={barClass} style={props.styles ? props.styles : barStyle}>
      {buttons}
    </div>
  );
};

CompactButtonBar.propTypes = {
  actions: PropTypes.array,
  styles: PropTypes.object,
};

export default CompactButtonBar;

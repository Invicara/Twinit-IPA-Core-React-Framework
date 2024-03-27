import React from "react";
import PropTypes from "prop-types";

const SimpleMultiSelect = ({ propName, available, selections, update }) => {
  let selected = selections.slice(0);
  let options = available
    .filter((v) => selected.indexOf(v) < 0)
    .map((v) => <option key={v}>{v}</option>);
  options.unshift(
    <option key="_none">
      {selected.length == 0 ? "Choose a value..." : "Choose another value..."}
    </option>,
  );
  let select = (
    <select
      onChange={(e) => {
        selectionAdded(e);
      }}
    >
      {options}
    </select>
  );

  const selectionAdded = (e) => {
    selected.push(e.target.value);
    update(propName, selected);
  };

  const selectionRemoved = (v) => {
    selected = selected.filter((vv) => vv != v);
    update(propName, selected);
  };

  let i = 0;
  return (
    <div className="filter-multi-select">
      {selections.map((v) => (
        <div
          key={"filter-multi-selet" + i++}
          className="filter-multi-select-value"
          onClick={(e) => selectionRemoved(v)}
        >
          {v}
        </div>
      ))}
      {select}
    </div>
  );
};

SimpleMultiSelect.propTypes = {
  propName: PropTypes.string,
  available: PropTypes.array,
  selections: PropTypes.array,
  update: PropTypes.func,
};

export default SimpleMultiSelect;

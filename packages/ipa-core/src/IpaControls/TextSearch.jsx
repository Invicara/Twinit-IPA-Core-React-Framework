import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { FetchButton } from "./FetchButton";
import { FetchingLegend } from "./FetchingLegend";

import "./TextSearch.scss";

export const TextSearch = ({
  currentValue,
  onChange,
  touched,
  onFetch,
  display,
  additionalOptions,
  isFetching,
}) => {
  const handleChange = useCallback(
    ({ target: { value } }) => {
      onChange(value);
    },
    [onChange],
  );

  return (
    <div className="text-search">
      <span className="title">{display}</span>
      <div className="search-term">
        <input
          value={currentValue || ""}
          onChange={handleChange}
          placeholder="Enter text to search for..."
        />
        <div className="clear">
          {!!currentValue && (
            <i
              onClick={() => onChange("")}
              title={"Clear"}
              className={`fas fa-times`}
            />
          )}
        </div>
      </div>
      {additionalOptions}
      <div className="text-fetch-button">
        <FetchButton
          disabled={!currentValue}
          onClick={onFetch}
          customClasses={touched && currentValue && "attention"}
        >
          Search
        </FetchButton>
        {isFetching && <FetchingLegend />}
      </div>
    </div>
  );
};

TextSearch.PropTypes = {
  currentValue: PropTypes.string,
  onChange: PropTypes.func,
  touched: PropTypes.bool,
  onFetch: PropTypes.func,
  display: PropTypes.string,
  additionalOptions: PropTypes.array,
  isFetching: PropTypes.bool,
};

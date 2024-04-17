import React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "@material-ui/core";

const SimpleTextReducer = ({ text, limit }) => {
  let newText;
  if (text.length > limit) {
    newText = text.substring(0, limit) + "...";
  }

  return (
    <div>
      {newText ? (
        <Tooltip title={text}>
          <i style={{ cursor: "pointer" }}>{newText}</i>
        </Tooltip>
      ) : (
        <i>{text}</i>
      )}
    </div>
  );
};

SimpleTextReducer.propTypes = {
  text: PropTypes.string,
  limit: PropTypes.number,
};

export default SimpleTextReducer;

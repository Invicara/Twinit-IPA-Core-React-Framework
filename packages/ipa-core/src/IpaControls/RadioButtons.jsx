import React from "react";
import PropTypes from "prop-types";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import {withStyles} from '@mui/styles';
import "./RadioButtons.scss";

const RadioButtons = ({ options, value, onChange, labelPlacement = "end" }) => {
  const AccentRadio = withStyles({
    root: {
      "&$checked": {
        color: "var(--app-accent-color)",
      },
    },
    checked: {},
  })((props) => <Radio color="default" {...props} />);

  return (
    <div className="ipa-radio-btns">
      <FormControl component="fieldset">
        <RadioGroup row value={value} onChange={onChange}>
          {options?.map((o) => (
            <FormControlLabel
              key={o}
              value={o}
              control={<AccentRadio />}
              label={o}
              labelPlacement={labelPlacement}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </div>
  );
};

RadioButtons.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  labelPlacement: PropTypes.string,
  options: PropTypes.array,
};

export default RadioButtons;

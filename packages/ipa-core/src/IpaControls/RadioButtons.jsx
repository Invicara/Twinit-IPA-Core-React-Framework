import React from 'react'
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

import './RadioButtons.scss'
import withStyles from '../IpaUtils/withStyles';

const RadioButtons = ({options, value, onChange, labelPlacement='end'}) => {

    const AccentRadio = withStyles(
      {
        root: {
          '&.Mui-checked': {
            color: 'var(--app-accent-color)',
          },
        },
        checked: {},
      },
      (props) => <Radio color="default" {...props} />
    );

    return (
        <div className='ipa-radio-btns'>
            <FormControl variant="standard" component="fieldset">
                <RadioGroup row value={value} onChange={onChange}>
                    {options.map(o => <FormControlLabel key={o} value={o} control={<AccentRadio />} label={o} labelPlacement={labelPlacement} />)}
                </RadioGroup>
            </FormControl>
        </div>
    );

}

export default RadioButtons
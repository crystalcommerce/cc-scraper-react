import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

export default function RadioButtonsGroup({legend, radioOptions, onChange, defaultValue}) {
  const [value, setValue] = React.useState(defaultValue || radioOptions[1].value);

  const handleChange = (event) => {
    setValue(event.target.value);
    onChange(event.target.value);
  };

  return (
    <FormControl component="fieldset">
        <FormLabel component="legend">{legend}</FormLabel>
        <RadioGroup aria-label="gender" name="gender1" value={value} onChange={handleChange}>
            {
                radioOptions.length  > 0 && radioOptions.map(item => {
                    return (
                        <FormControlLabel value={item.value} key={item.value} control={<Radio />} label={ item.label } />
                    );
                })
            }
        </RadioGroup>
    </FormControl>
  );
}
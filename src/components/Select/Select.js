import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import styles from "./Select.module.scss";

const useStyles = makeStyles((theme) => ({
    formControl: {
    //   margin: theme.spacing(1),
      minWidth: 250,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }));

export default function Select2({label, options, uniqueProp, optionLabelProp, selectOnchangeHandler, defaultValue})    {
    const classes = useStyles();
    const [selectedOption, setSeletedOption] = useState("");

    const handleChange = (e) => {
        e.preventDefault();

        setSeletedOption(prev => e.target.value);
        selectOnchangeHandler(e.target.value);
    }

    useEffect(() => {
        if(defaultValue) {
            setSeletedOption(defaultValue[uniqueProp]);
        }
    }, [defaultValue])

    return (
        <FormControl className={`${classes.formControl} ${styles.select}`}>
            <InputLabel id="demo-simple-select-label">{label}</InputLabel>
            <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedOption}
            onChange={handleChange}
            >   
                {options.length > 0 && options.map(item => {
                    return (
                        <MenuItem key={item[uniqueProp]} value={item[uniqueProp]} selected>{item[optionLabelProp]}</MenuItem>
                    )
                })}
                {options.length === 0 && options.map(item => {
                    return (
                        <MenuItem disabled key={item[uniqueProp]} value={item[uniqueProp]}>{item[optionLabelProp]}</MenuItem>
                    )
                })}
            </Select>
        </FormControl>
    )
}
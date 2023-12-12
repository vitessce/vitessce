import React from 'react';
import { Select } from '@mui/material';
import { useStyles } from './styles.js';

export default function OptionSelect(props) {
  const { classes: classesProp = {} } = props;
  const classes = useStyles();
  return (
    <Select
      native
      disableUnderline
      {...props}
      classes={{
        root: classes.optionSelectRoot,
        ...classesProp,
      }}
      aria-label="Select an option"
    />
  );
}

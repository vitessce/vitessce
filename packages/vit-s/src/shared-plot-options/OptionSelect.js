import React from 'react';
import Select from '@material-ui/core/es/Select/index.js';
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
        root: classes.selectRoot,
        ...classesProp,
      }}
    />
  );
}

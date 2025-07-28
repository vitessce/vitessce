import React from 'react';
import { NativeSelect } from '@vitessce/styles';
import { useStyles } from './styles.js';

export default function OptionSelect(props) {
  const { classes: classesProp = {} } = props;
  const { classes } = useStyles();
  return (
    <NativeSelect
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

import React from 'react';
import Select from '@material-ui/core/Select';
import { useStyles } from './styles';


export default function OptionSelect(props) {
  const classes = useStyles();
  return (
    <Select
      native
      {...props}
      classes={{ root: classes.selectRoot }}
      disableUnderline
    />
  );
}

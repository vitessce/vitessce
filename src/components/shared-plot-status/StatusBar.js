/* eslint-disable */
import React from 'react';
import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import { useStyles } from './styles';

export default function StatusBar(props) {
  const {
    children,
    coordinationValues,
    info,
  } = props;

  const classes = useStyles();
  
  const title = `Dataset: ${coordinationValues.dataset}`;
  
  return (
    <Box className={classes.box}>
      <span className={classes.statusText} title={title}>{info}</span>
    </Box>
  );
}

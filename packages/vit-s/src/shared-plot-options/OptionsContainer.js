import React from 'react';
import { Box } from '@material-ui/core';
import { Table } from '@material-ui/core';
import { TableBody } from '@material-ui/core';
import { TableContainer } from '@material-ui/core';
import { useStyles } from './styles.js';

export default function OptionsContainer(props) {
  const {
    children,
  } = props;

  const classes = useStyles();

  return (
    <Box className={classes.box}>
      <TableContainer className={classes.tableContainer}>
        <Table className={classes.table} size="small">
          <TableBody>
            {children}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

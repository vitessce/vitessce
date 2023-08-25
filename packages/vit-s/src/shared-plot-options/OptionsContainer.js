import React from 'react';
import { Box, Table, TableBody, TableContainer } from '@material-ui/core';
import { useStyles } from './styles.js';

export default function OptionsContainer(props) {
  const {
    children,
  } = props;

  const classes = useStyles();

  return (
    <Box className={classes.box}>
      <TableContainer className={classes.tableContainer}>
        <Table
          className={classes.table}
          size="small"
          aria-label="Menu of options available for the view"
        >
          <TableBody>
            {children}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

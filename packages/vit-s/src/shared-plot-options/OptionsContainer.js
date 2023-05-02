import React from 'react';
import Box from '@material-ui/core/es/Box/index.js';
import Table from '@material-ui/core/es/Table/index.js';
import TableBody from '@material-ui/core/es/TableBody/index.js';
import TableContainer from '@material-ui/core/es/TableContainer/index.js';
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

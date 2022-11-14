import React from 'react';
import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import { useStyles } from './styles';

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

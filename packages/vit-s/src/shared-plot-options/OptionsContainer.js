import React from 'react';
import { Table, TableBody } from '@mui/material';
import { StyledTableContainer, BorderBox } from './styles.js';

export default function OptionsContainer(props) {
  const {
    children,
  } = props;


  return (
    <BorderBox>
      <StyledTableContainer>
        <Table
          size="small"
          aria-label="Menu of options available for the view"
        >
          <TableBody>
            {children}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </BorderBox>
  );
}

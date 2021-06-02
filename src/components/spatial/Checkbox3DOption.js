import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

export default function Checkbox3DOption(props) {
  const {
    use3D,
    setUse3D,
  } = props;
  return (
    <TableRow>
      <TableCell htmlFor="use3D-checkbox">
        Use 3D
      </TableCell>
      <TableCell>
        <Checkbox
          checked={use3D}
          onChange={() => setUse3D(!use3D)}
          inputProps={{
            id: 'use3D-checkbox',
          }}
        />
      </TableCell>
    </TableRow>
  );
}

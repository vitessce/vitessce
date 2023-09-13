import React from 'react';
import { useId } from 'react-aria';
import { TableCell, TableRow } from '@material-ui/core';
import { capitalize } from '@vitessce/utils';
import OptionSelect from './OptionSelect.js';
import { useStyles } from './styles.js';

export default function CellColorEncodingOption(props) {
  const {
    observationsLabel,
    cellColorEncoding,
    setCellColorEncoding,
  } = props;

  const classes = useStyles();

  const cellColorEncodingId = useId();

  const observationsLabelNice = capitalize(observationsLabel);

  function handleColorEncodingChange(event) {
    setCellColorEncoding(event.target.value);
  }

  return (
    <TableRow>
      <TableCell className={classes.labelCell} variant="head" scope="row">
        <label
          htmlFor={`cell-color-encoding-select-${cellColorEncodingId}`}
        >
          {observationsLabelNice} Color Encoding
        </label>
      </TableCell>
      <TableCell className={classes.inputCell} variant="body">
        <OptionSelect
          className={classes.select}
          value={cellColorEncoding}
          onChange={handleColorEncodingChange}
          inputProps={{
            id: `cell-color-encoding-select-${cellColorEncodingId}`,
          }}
        >
          <option value="cellSetSelection">Cell Sets</option>
          <option value="geneSelection">Gene Expression</option>
        </OptionSelect>
      </TableCell>
    </TableRow>
  );
}

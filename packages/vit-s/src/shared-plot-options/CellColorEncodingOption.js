import React from 'react';
import TableCell from '@material-ui/core/es/TableCell/index.js';
import TableRow from '@material-ui/core/es/TableRow/index.js';
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

  const observationsLabelNice = capitalize(observationsLabel);

  function handleColorEncodingChange(event) {
    setCellColorEncoding(event.target.value);
  }

  return (
    <TableRow>
      <TableCell className={classes.labelCell} htmlFor="cell-color-encoding-select">
        {observationsLabelNice} Color Encoding
      </TableCell>
      <TableCell className={classes.inputCell}>
        <OptionSelect
          className={classes.select}
          value={cellColorEncoding}
          onChange={handleColorEncodingChange}
          inputProps={{
            id: 'cell-color-encoding-select',
          }}
        >
          <option value="cellSetSelection">Cell Sets</option>
          <option value="geneSelection">Gene Expression</option>
        </OptionSelect>
      </TableCell>
    </TableRow>
  );
}

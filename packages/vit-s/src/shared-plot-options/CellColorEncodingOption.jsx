import React from 'react';
import { useId } from 'react-aria';
import { TableRow } from '@mui/material';
import { capitalize } from '@vitessce/utils';
import { InputCell, LabelCell } from './styles.js';
import { StyledOptionSelect } from './OptionSelect.jsx';

export default function CellColorEncodingOption(props) {
  const {
    observationsLabel,
    cellColorEncoding,
    setCellColorEncoding,
  } = props;


  const cellColorEncodingId = useId();

  const observationsLabelNice = capitalize(observationsLabel);

  function handleColorEncodingChange(event) {
    setCellColorEncoding(event.target.value);
  }

  return (
    <TableRow>
      <LabelCell variant="head" scope="row">
        <label
          htmlFor={`cell-color-encoding-select-${cellColorEncodingId}`}
        >
          {observationsLabelNice} Color Encoding
        </label>
      </LabelCell>
      <InputCell variant="body">
        <StyledOptionSelect
          value={cellColorEncoding}
          onChange={handleColorEncodingChange}
          inputProps={{
            id: `cell-color-encoding-select-${cellColorEncodingId}`,
          }}
        >
          <option value="cellSetSelection">Cell Sets</option>
          <option value="geneSelection">Gene Expression</option>
        </StyledOptionSelect>
      </InputCell>
    </TableRow>
  );
}

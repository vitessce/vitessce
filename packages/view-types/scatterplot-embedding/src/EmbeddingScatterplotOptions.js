import React from 'react';
import { useId } from 'react-aria';
import { TableRow } from '@mui/material';
import { StyledOptionSelect, LabelCell, InputCell } from '@vitessce/vit-s';

export default function EmbeddingScatterplotOptions(props) {
  const {
    mappingSelectEnabled,
    mappings,
    selectedMapping,
    setSelectedMapping,
  } = props;


  const scatterplotOptionsId = useId();

  // Handlers for custom option field changes.
  const handleSelectedMappingChange = (event) => {
    setSelectedMapping(event.target.value);
  };

  return mappingSelectEnabled
    ? (
      <TableRow>
        <LabelCell variant="head" scope="row">
          <label
            htmlFor={`scatterplot-mapping-select-${scatterplotOptionsId}`}
          >
            Embedding Type
          </label>
        </LabelCell>
        <InputCell variant="body">
          <StyledOptionSelect
            value={selectedMapping}
            onChange={handleSelectedMappingChange}
            inputProps={{
              id: `scatterplot-mapping-select-${scatterplotOptionsId}`,
            }}
          >
            {mappings.map(name => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </StyledOptionSelect>
        </InputCell>
      </TableRow>
    )
    : null;
}

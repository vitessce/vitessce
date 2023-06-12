import React from 'react';
import { TableCell, TableRow } from '@material-ui/core';
import { usePlotOptionsStyles, OptionSelect } from '@vitessce/vit-s';

export default function EmbeddingScatterplotOptions(props) {
  const {
    mappingSelectEnabled,
    mappings,
    selectedMapping,
    setSelectedMapping,
  } = props;

  const classes = usePlotOptionsStyles();

  // Handlers for custom option field changes.
  const handleSelectedMappingChange = (event) => {
    setSelectedMapping(event.target.value);
  };

  return mappingSelectEnabled
    ? (
      <TableRow key="mapping-option-row">
        <TableCell className={classes.plotOptionsLabelCell}>
          Embedding Type
        </TableCell>
        <TableCell className={classes.plotOptionsInputCell}>
          <OptionSelect
            key="scatterplot-mapping-select"
            className={classes.plotOptionsSelect}
            value={selectedMapping}
            onChange={handleSelectedMappingChange}
            inputProps={{
              id: 'scatterplot-mapping-select',
            }}
          >
            {mappings.map(name => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </OptionSelect>
        </TableCell>
      </TableRow>
    )
    : null;
}

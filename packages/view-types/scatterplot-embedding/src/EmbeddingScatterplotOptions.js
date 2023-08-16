import React, { useId } from 'react';
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

  const scatterplotOptionsId = useId();

  // Handlers for custom option field changes.
  const handleSelectedMappingChange = (event) => {
    setSelectedMapping(event.target.value);
  };

  return mappingSelectEnabled
    ? (
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label
            htmlFor={['scatterplot-mapping-select', scatterplotOptionsId].join('-')}
          >
            Embedding Type
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            key="scatterplot-mapping-select"
            className={classes.select}
            value={selectedMapping}
            onChange={handleSelectedMappingChange}
            inputProps={{
              id: ['scatterplot-mapping-select', scatterplotOptionsId].join('-'),
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

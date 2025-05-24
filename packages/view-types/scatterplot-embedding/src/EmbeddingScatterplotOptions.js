import React from 'react';
import { useId } from 'react-aria';
import { TableCell, TableRow } from '@vitessce/styles';
import { usePlotOptionsStyles, OptionSelect } from '@vitessce/vit-s';

export default function EmbeddingScatterplotOptions(props) {
  const {
    mappingSelectEnabled,
    mappings,
    selectedMapping,
    setSelectedMapping,
  } = props;

  const { classes } = usePlotOptionsStyles();

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
            htmlFor={`scatterplot-mapping-select-${scatterplotOptionsId}`}
          >
            Embedding Type
          </label>
        </TableCell>
        <TableCell className={classes.inputCell} variant="body">
          <OptionSelect
            className={classes.select}
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
          </OptionSelect>
        </TableCell>
      </TableRow>
    )
    : null;
}

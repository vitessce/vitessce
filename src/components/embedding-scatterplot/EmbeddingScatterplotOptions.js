import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { useStyles } from '../shared-plot-options/styles';
import OptionSelect from '../shared-plot-options/OptionSelect';

export default function EmbeddingScatterplotOptions(props) {
  const {
    mappingSelectEnabled,
    mappings,
    selectedMapping,
    setSelectedMapping,
  } = props;

  const classes = useStyles();

  const mappingSelectOptions = mappings;

  // Handlers for custom option field changes.
  const handleSelectedMappingChange = (event) => {
    setSelectedMapping(event.target.value);
  };

  return mappingSelectEnabled
    ? (
      <TableRow key="mapping-option-row">
        <TableCell className={classes.labelCell}>
          Embedding Type
        </TableCell>
        <TableCell className={classes.inputCell}>
          <OptionSelect
            key="scatterplot-mapping-select"
            className={classes.select}
            value={selectedMapping}
            onChange={handleSelectedMappingChange}
            inputProps={{
              id: 'scatterplot-mapping-select',
            }}
          >
            {mappingSelectOptions.map(name => (
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

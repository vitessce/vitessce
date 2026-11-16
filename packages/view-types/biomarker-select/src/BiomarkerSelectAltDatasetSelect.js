import React from 'react';
import { Grid, NativeSelect } from '@vitessce/styles';

/**
 * Dropdown for selecting which dataset (e.g., data modality such as
 * single-cell vs. single-nucleus) is currently being viewed.
 * Renders nothing unless there are at least two dataset options.
 * @param {object} props
 * @param {{ uid: string, name: string }[]} props.datasetOptions
 * @param {string} props.dataset The uid of the currently-selected dataset.
 * @param {Function} props.setDataset
 */
export function BiomarkerSelectAltDatasetSelect(props) {
  const {
    datasetOptions,
    dataset,
    setDataset,
  } = props;

  if (!Array.isArray(datasetOptions) || datasetOptions.length < 2) {
    return null;
  }

  function handleChange(event) {
    setDataset(event.target.value);
  }

  return (
    <Grid container size={12} wrap="nowrap">
      <Grid container size="auto">
        <span style={{ lineHeight: '50px', whiteSpace: 'nowrap' }}>Modality:&nbsp;</span>
      </Grid>
      <Grid container size="grow" sx={{ minWidth: 0 }}>
        <NativeSelect
          onChange={handleChange}
          value={dataset ?? ''}
          variant="standard"
          sx={{ width: '100%' }}
          inputProps={{ 'aria-label': 'Select dataset' }}
        >
          {datasetOptions.map(o => (
            <option key={o.uid} value={o.uid}>{o.name ?? o.uid}</option>
          ))}
        </NativeSelect>
      </Grid>
    </Grid>
  );
}

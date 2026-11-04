import React from 'react';
import { Grid } from '@vitessce/styles';
import { BiomarkerSelectAltGeneAutocomplete } from './BiomarkerSelectAltGeneAutocomplete.js';
import { BiomarkerSelectAltSampleGroups } from './BiomarkerSelectAltSampleGroups.js';
import { BiomarkerSelectAltDatasetSelect } from './BiomarkerSelectAltDatasetSelect.js';
import { useStyles } from './styles.js';


export function BiomarkerSelectAlt(props) {
  const {
    setFeatureSelection,
    setSampleSetFilter,
    setSampleSetSelection,
    sampleSetSelection,

    biomarkerSelection,
    setBiomarkerSelection,
    resolvedBiomarker,

    autocompleteNode,
    getEdges,

    stratifications,

    datasetOptions,
    dataset,
    setDataset,
  } = props;
  const { classes } = useStyles();
  const hasMultipleDatasets = Array.isArray(datasetOptions) && datasetOptions.length > 1;

  return (
    <Grid container sx={{ border: '0px solid red' }}>
      <Grid container size={12} className={classes.header}>
        <Grid
          container
          size={4}
          sx={{
            justifyContent: 'flex-end',
          }}
        >
          <BiomarkerSelectAltGeneAutocomplete
            setFeatureSelection={setFeatureSelection}
            autocompleteNode={autocompleteNode}
            getEdges={getEdges}

            biomarkerSelection={biomarkerSelection}
            setBiomarkerSelection={setBiomarkerSelection}
            resolvedBiomarker={resolvedBiomarker}
          />
        </Grid>
        {hasMultipleDatasets ? (
          <Grid
            container
            size={3}
            sx={{
              justifyContent: 'flex-start',
              flexDirection: 'column',
            }}
          >
            <BiomarkerSelectAltDatasetSelect
              datasetOptions={datasetOptions}
              dataset={dataset}
              setDataset={setDataset}
            />
          </Grid>
        ) : null}
        <Grid
          container
          size={5}
          sx={{
            justifyContent: 'flex-start',
            flexDirection: 'column',
          }}
        >
          <BiomarkerSelectAltSampleGroups
            setSampleSetFilter={setSampleSetFilter}
            setSampleSetSelection={setSampleSetSelection}
            sampleSetSelection={sampleSetSelection}

            stratifications={stratifications}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

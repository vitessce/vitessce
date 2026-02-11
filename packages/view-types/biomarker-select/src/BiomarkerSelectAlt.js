import React from 'react';
import { Grid } from '@vitessce/styles';
import { BiomarkerSelectAltGeneAutocomplete } from './BiomarkerSelectAltGeneAutocomplete.js';
import { BiomarkerSelectAltSampleGroups } from './BiomarkerSelectAltSampleGroups.js';
import { useStyles } from './styles.js';


export function BiomarkerSelectAlt(props) {
  const {
    setFeatureSelection,
    setSampleSetFilter,
    setSampleSetSelection,

    currentModalityAgnosticSelection,
    setCurrentModalityAgnosticSelection,
    setCurrentModalitySpecificSelection,

    autocompleteNode,

    stratifications,
  } = props;
  const { classes } = useStyles();


  return (
    <Grid container sx={{ border: '0px solid red' }}>
      <Grid container size={12} className={classes.header}>
        <Grid container size={4} justifyContent="flex-end">
          <BiomarkerSelectAltGeneAutocomplete
            setFeatureSelection={setFeatureSelection}
            autocompleteNode={autocompleteNode}

            currentModalityAgnosticSelection={currentModalityAgnosticSelection}
            setCurrentModalityAgnosticSelection={setCurrentModalityAgnosticSelection}
            setCurrentModalitySpecificSelection={setCurrentModalitySpecificSelection}
          />
        </Grid>
        <Grid container size={5} justifyContent="flex-start" flexDirection="column">
          <BiomarkerSelectAltSampleGroups
            setSampleSetFilter={setSampleSetFilter}
            setSampleSetSelection={setSampleSetSelection}

            stratifications={stratifications}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

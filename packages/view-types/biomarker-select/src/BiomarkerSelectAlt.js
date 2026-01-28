/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Button, ButtonGroup, Grid, Tooltip } from '@vitessce/styles';
import { BiomarkerSelectAltGeneAutocomplete } from './BiomarkerSelectAltGeneAutocomplete.js';
import { BiomarkerSelectAltSampleGroups } from './BiomarkerSelectAltSampleGroups.js';
import { useStyles } from './styles.js';


export function BiomarkerSelectAlt(props) {
  const {
    setFeatureSelection,
    setSampleSetFilter,
    setSampleSetSelection,

    mode: modeProp,
    setMode,
    step: stepProp,
    setStep,
    currentModalityAgnosticSelection,
    setCurrentModalityAgnosticSelection,
    currentModalitySpecificSelection,
    setCurrentModalitySpecificSelection,
    currentStratificationSelection,
    setCurrentStratificationSelection,

    autocompleteNode,

    getEdges,
    stratifications,
    onFinish,
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
            currentModalitySpecificSelection={currentModalitySpecificSelection}
            setCurrentModalitySpecificSelection={setCurrentModalitySpecificSelection}
            currentStratificationSelection={currentStratificationSelection}
            setCurrentStratificationSelection={setCurrentStratificationSelection}

            getEdges={getEdges}
            stratifications={stratifications}
            onFinish={onFinish}
          />
        </Grid>
        <Grid container size={5} justifyContent="flex-start" flexDirection="column">
          <BiomarkerSelectAltSampleGroups
            setFeatureSelection={setFeatureSelection}
            setSampleSetFilter={setSampleSetFilter}
            setSampleSetSelection={setSampleSetSelection}

            autocompleteNode={autocompleteNode}

            currentModalityAgnosticSelection={currentModalityAgnosticSelection}
            setCurrentModalityAgnosticSelection={setCurrentModalityAgnosticSelection}
            currentModalitySpecificSelection={currentModalitySpecificSelection}
            setCurrentModalitySpecificSelection={setCurrentModalitySpecificSelection}
            currentStratificationSelection={currentStratificationSelection}
            setCurrentStratificationSelection={setCurrentStratificationSelection}

            getEdges={getEdges}
            stratifications={stratifications}
            onFinish={onFinish}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

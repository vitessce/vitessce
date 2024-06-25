import React from 'react';
import { Button, ButtonGroup, Grid, Typography } from '@material-ui/core';
import { ConfirmatoryStepper } from './confirmatory-stepper.js';
import { useStyles } from './styles.js';


export function ScmdUi(props) {
  const {
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
  const classes = useStyles();

  const mode = modeProp || 'confirmatory';
  const step = mode === 'confirmatory' ? (stepProp || 'select-biomarkers') : (stepProp || 'define-stratification');

  const isConfirmatoryMode = mode === 'confirmatory';
  return (
    <Grid container style={{ border: '1px solid red' }}>
      {/* Header */}
      <Grid item container xs={12} className={classes.header}>
        <Grid item xs={8}>
          <Typography variant="h5">
            Comparative visual analysis of atlas data
          </Typography>
        </Grid>
        <Grid item container xs={4} justifyContent="flex-end">
          <ButtonGroup variant="outlined" size="small" color="secondary" aria-label="Toggle between confirmatory and exploratory modes">
            <Button variant={isConfirmatoryMode ? 'contained' : 'outlined'} onClick={() => setMode('confirmatory')}>Confirmatory (Hypothesis-driven)</Button>
            <Button variant={!isConfirmatoryMode ? 'contained' : 'outlined'} onClick={() => setMode('exploratory')}>Exploratory (Hypothesis-generating)</Button>
          </ButtonGroup>
        </Grid>
      </Grid>
      {/* Stepper */}
      {mode === 'confirmatory' ? (
        <ConfirmatoryStepper
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
      ) : null}
      {mode === 'exploratory' ? <span>TODO</span> : null}
    </Grid>
  );
}

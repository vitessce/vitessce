import React, { useEffect } from 'react';
import { Stepper, Step, StepLabel, Button, Grid, Box, Typography } from '@vitessce/styles';
import { ConfirmatoryCart } from './cart.js';
import { SelectStratification } from './select-stratification.js';
import { useStyles } from './styles.js';

const steps = [
  'Define case-control stratification',
];

export function ExploratoryStepper(props) {
  const {
    autocompleteNode,

    currentModalityAgnosticSelection,
    setCurrentModalityAgnosticSelection,
    currentModalitySpecificSelection,
    setCurrentModalitySpecificSelection,
    currentStratificationSelection,
    setCurrentStratificationSelection,

    getEdges,
    stratifications,
    onFinish,
  } = props;
  const { classes } = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  const isStepOptional = step => step === 2;

  const isStepSkipped = step => skipped.has(step);

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep(prevActiveStep => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  useEffect(() => {
    if (activeStep === steps.length) {
      onFinish();
    }
  }, [activeStep, steps]);


  return (
    <Grid container size={12}>
      <Grid container size={12}>
        <Box className={classes.fullWidthBox}>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
              const stepProps = {};
              const labelProps = {};
              if (isStepOptional(index)) {
                labelProps.optional = (
                  <Typography variant="caption">Optional</Typography>
                );
              }
              if (isStepSkipped(index)) {
                stepProps.completed = false;
              }
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Box>
      </Grid>
      <Grid container size={12} sx={{ marginTop: '20px' }} alignItems="flex-start">
        {/* Step contents to left of cart */}
        <Grid container size={8}>
          {activeStep === steps.length ? (
            <>
              <Typography style={{ marginTop: '20px', marginBottom: '10px' }}>
                All steps completed - you&apos;re finished
              </Typography>
            </>
          ) : (
            <>
              {activeStep === 0 ? (
                <SelectStratification
                  autocompleteNode={autocompleteNode}

                  currentModalityAgnosticSelection={currentModalityAgnosticSelection}
                  setCurrentModalityAgnosticSelection={setCurrentModalityAgnosticSelection}
                  currentModalitySpecificSelection={currentModalitySpecificSelection}
                  setCurrentModalitySpecificSelection={setCurrentModalitySpecificSelection}
                  currentStratificationSelection={currentStratificationSelection}
                  setCurrentStratificationSelection={setCurrentStratificationSelection}

                  getEdges={getEdges}
                  stratifications={stratifications}
                />
              ) : null}
            </>
          )}
        </Grid>
        {/* Cart */}
        <Grid container size={4}>
          <ConfirmatoryCart
            currentModalityAgnosticSelection={currentModalityAgnosticSelection}
            setCurrentModalityAgnosticSelection={setCurrentModalityAgnosticSelection}
            currentModalitySpecificSelection={currentModalitySpecificSelection}
            setCurrentModalitySpecificSelection={setCurrentModalitySpecificSelection}
            currentStratificationSelection={currentStratificationSelection}
            setCurrentStratificationSelection={setCurrentStratificationSelection}
            stratifications={stratifications}
          />
        </Grid>
        {/* Step navigation button footer */}
        <Box className={classes.fullWidthBox}>
          {activeStep === steps.length ? (
            <>
              <Box style={{ display: 'flex', flexDirection: 'row', paddingTop: '20px' }}>
                <Box style={{ flex: '1 1 auto' }} />
                <Button onClick={handleReset}>Reset</Button>
              </Box>
            </>
          ) : (
            <Box style={{ display: 'flex', flexDirection: 'row', paddingTop: '20px' }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                style={{ mr: 1 }}
              >
                Back
              </Button>
              <Box style={{ flex: '1 1 auto' }} />
              {isStepOptional(activeStep) && (
                <Button color="inherit" onClick={handleSkip} style={{ marginRight: '10px' }}>
                  Skip
                </Button>
              )}
              <Button onClick={handleNext}>
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}

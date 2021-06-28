/* eslint-disable */
import React, { useState } from 'react';
import { useStyles } from './editor-overlay-styles';

import Box from '@material-ui/core/Box';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';


import CodeIcon from '@material-ui/icons/Code';
import DatasetIcon from '@material-ui/icons/Storage';
import NewIcon from '@material-ui/icons/FiberNew';
import ComponentIcon from '@material-ui/icons/ViewCompact';
import CoordinationIcon from '@material-ui/icons/LeakAdd';

export default function EditorOverlay(props) {
  const {
    
  } = props;

  const classes = useStyles();
  
  const [activeStep, setActiveStep] = useState(0);
  
  return (
    <Box className={classes.overlayBox}>
      <div className={classes.overlayHeader}>
        <Stepper nonLinear activeStep={activeStep} classes={{ root: classes.stepperRoot }}>
          <Step>
            <StepButton onClick={() => setActiveStep(0)} icon={<DatasetIcon />} classes={{ root: classes.stepButtonRoot }}>
              Datasets
            </StepButton>
          </Step>
          <Step>
            <StepButton onClick={() => setActiveStep(1)} icon={<ComponentIcon />} classes={{ root: classes.stepButtonRoot }}>
              Components
            </StepButton>
          </Step>
          <Step>
            <StepButton onClick={() => setActiveStep(2)} icon={<CoordinationIcon />} classes={{ root: classes.stepButtonRoot }}>
              Coordination
            </StepButton>
          </Step>
        </Stepper>
        <div>
          <Button aria-label="edit" variant="outlined" size="small" disableElevation color="primary" className={classes.codeButton} startIcon={<CodeIcon fontSize="small" />}>
            Edit JSON
          </Button>
        </div>
      </div>
    </Box>
  );
}

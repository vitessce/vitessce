import React, { useMemo } from 'react';
import { useStyles } from './styles.js';
// import type { QueryFunctionContext } from '@tanstack/react-query';
import { useQueries } from '@tanstack/react-query';
// import type { KgAutocompleteFunc, KgEdgeGetterFunc, KgNode, ConfirmatoryCartProps, ConfirmatoryStepperProps } from '../old-src/types.js';
import { Grid, Box, TextField, FormHelperText, Accordion, AccordionDetails, AccordionSummary, Typography, Select, FormControl, InputLabel } from '@material-ui/core';
import { Add as AddIcon, ExpandMore as ExpandMoreIcon } from '@material-ui/icons';


export function ConfirmatoryCart(props) {
  const {
    currentModalityAgnosticSelection,
    setCurrentModalityAgnosticSelection,
    currentModalitySpecificSelection,
    setCurrentModalitySpecificSelection,
    currentStratificationSelection,
    setCurrentStratificationSelection,
  } = props;
  const classes = useStyles();
  const [expandedAccordions, setExpandedAccordions] = React.useState([
    'agnostic', 'specific', 'stratification',
  ]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
      if (isExpanded) {
        setExpandedAccordions([...expandedAccordions, panel]);
      } else {
        setExpandedAccordions(expandedAccordions.filter((item) => item !== panel));
      }
  };

  return (
    <>
      <Typography>Current selections</Typography>
        <Accordion className={classes.accordion} expanded={expandedAccordions.includes('agnostic')} onChange={handleAccordionChange('agnostic')}>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
            >
                <Typography>
                    Modality-agnostic biomarkers
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                  <ul>
                    {currentModalityAgnosticSelection ? (
                      currentModalityAgnosticSelection.map((item) => (
                        <li key={item.kgId}>{item.label} ({item.nodeType})</li>
                      ))
                    ) : null}
                  </ul>
            </AccordionDetails>
        </Accordion>
        <Accordion className={classes.accordion} expanded={expandedAccordions.includes('specific')} onChange={handleAccordionChange('specific')}>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2bh-content"
            id="panel2bh-header"
            >
                <Typography>
                    Modality-specific signature
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <ul>
                    {currentModalitySpecificSelection ? (
                      currentModalitySpecificSelection.map((item) => (
                        <li key={item.kgId}>{item.label} ({item.nodeType})</li>
                      ))
                    ) : null}
                </ul>
            </AccordionDetails>
        </Accordion>
        <Accordion className={classes.accordion} expanded={expandedAccordions.includes('stratification')} onChange={handleAccordionChange('stratification')}>
          <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3bh-content"
          id="panel3bh-header"
          >
              <Typography>
                  Case-control stratification
              </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ul>
              {currentStratificationSelection ? (
                <li>{currentStratificationSelection.name}</li>
              ) : null}
            </ul>
          </AccordionDetails>
      </Accordion>
    </>
  );
}

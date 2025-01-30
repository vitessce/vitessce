import React from 'react';
import { AccordionSummary, Typography } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, CartList } from './styles.js';


export function ConfirmatoryCart(props) {
  const {
    currentModalityAgnosticSelection,
    // eslint-disable-next-line no-unused-vars
    setCurrentModalityAgnosticSelection,
    currentModalitySpecificSelection,
    // eslint-disable-next-line no-unused-vars
    setCurrentModalitySpecificSelection,
    currentStratificationSelection,
    // eslint-disable-next-line no-unused-vars
    setCurrentStratificationSelection,
  } = props;
  const [expandedAccordions, setExpandedAccordions] = React.useState([
    'agnostic', 'specific', 'stratification',
  ]);

  const handleAccordionChange = panel => (event, isExpanded) => {
    if (isExpanded) {
      setExpandedAccordions([...expandedAccordions, panel]);
    } else {
      setExpandedAccordions(expandedAccordions.filter(item => item !== panel));
    }
  };

  return (
    <>
      <Typography>Current selections</Typography>
      <Accordion expanded={expandedAccordions.includes('agnostic')} onChange={handleAccordionChange('agnostic')}>
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
          <CartList>
            {currentModalityAgnosticSelection ? (
              currentModalityAgnosticSelection.map(item => (
                <li key={item.kgId}>{item.label} ({item.nodeType})</li>
              ))
            ) : null}
          </CartList>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expandedAccordions.includes('specific')} onChange={handleAccordionChange('specific')}>
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
          <CartList>
            {currentModalitySpecificSelection ? (
              currentModalitySpecificSelection.map(item => (
                <li key={item.kgId}>{item.label} ({item.nodeType})</li>
              ))
            ) : null}
          </CartList>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expandedAccordions.includes('stratification')} onChange={handleAccordionChange('stratification')}>
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
          <CartList>
            {currentStratificationSelection ? (
              <li>{currentStratificationSelection.name}</li>
            ) : null}
          </CartList>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

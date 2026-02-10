import React, { useState } from 'react';
import {
  Grid, Button,
  Typography,
  Dialog,
  Info as InfoIcon,
  SimpleAutocomplete,
} from '@vitessce/styles';
import { useStyles } from './styles.js';


export function BiomarkerSelectAltGeneAutocomplete(props) {
  const {
    setFeatureSelection,
    autocompleteNode,
    currentModalityAgnosticSelection,
    setCurrentModalityAgnosticSelection,
    setCurrentModalitySpecificSelection,
  } = props;
  const { classes } = useStyles();

  const [selectedItem, setSelectedItem] = useState(null);

  const [biomarkerInfoOpen, setBiomarkerInfoOpen] = useState(false);


  function confirmSelectedItem() {
    // eslint-disable-next-line max-len
    if (selectedItem && !currentModalityAgnosticSelection?.find(item => item.kgId === selectedItem?.kgId)) {
      setCurrentModalityAgnosticSelection([
        ...(currentModalityAgnosticSelection || []),
        selectedItem,
      ]);
      // TODO: directly set featureSelection coordination value here instead?
      console.log('Setting specific selection to:', selectedItem);
      const nextModalitySpecificSelection = [
        ...(currentModalityAgnosticSelection || []),
        selectedItem,
      ];
      setFeatureSelection(nextModalitySpecificSelection.map(d => d.label));
    }
  }

  function clearBiomarkerSelection() {
    setCurrentModalityAgnosticSelection([]);
    setCurrentModalitySpecificSelection([]);
    setFeatureSelection([]);
  }

  return (
    <>
      <Grid container size={12}>
        <Grid size={8}>
          <SimpleAutocomplete
            getMatches={autocompleteNode}
            onChange={item => setSelectedItem(item.data)}
            textInputLabel="Enter a gene"
            getItemLabel={(item) => `${item.label} (${item.data.nodeType})`}
          />
        </Grid>
        {selectedItem ? (
          <Grid size={4}>
            &nbsp;
            <Button
              variant="contained"
              onClick={confirmSelectedItem}
            >
              Select
            </Button>
          </Grid>
        ) : null}
      </Grid>
      {selectedItem ? (
        <>
          <Grid container size={12} flexDirection="row">
            <Button onClick={() => setBiomarkerInfoOpen(true)}>
              View {selectedItem.nodeType} info
            </Button>
          </Grid>
          <Dialog open={biomarkerInfoOpen} onClose={() => setBiomarkerInfoOpen(false)} maxWidth="md">
            <Typography variant="h4" title={selectedItem.term}>
              {selectedItem.label}
            </Typography>
            <Grid container size={12}>
              <InfoIcon />
              <Typography variant="h6">About this {selectedItem.nodeType}</Typography>
            </Grid>
            <Grid container size={12} key={selectedItem.term} sx={{ width: '800px' }}>
              <iframe
                title={`Embedded metadata page for ontology term ${selectedItem.term}`}
                src={`https://identifiers.org/${selectedItem.term}`}
                width="100%"
                height="500"
                style={{ border: 0 }}
              />
            </Grid>
          </Dialog>
        </>
      ) : null}
    </>
  );
}

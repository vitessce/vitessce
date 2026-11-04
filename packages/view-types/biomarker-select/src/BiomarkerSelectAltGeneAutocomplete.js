import React, { useState } from 'react';
import { uniqBy } from 'lodash-es';
import {
  Grid, Button,
  Typography,
  Dialog,
  Info as InfoIcon,
  SimpleAutocomplete,
} from '@vitessce/styles';

/**
 * Check whether a knowledge graph node matches a biomarkerSelection value.
 * @param {{ label: string, nodeType: string } | null} node
 * @param {{ label: string, nodeType: string } | null} biomarkerSelection
 * @returns {boolean}
 */
function isSameBiomarker(node, biomarkerSelection) {
  return Boolean(node && biomarkerSelection
    && node.label === biomarkerSelection.label
    && node.nodeType === biomarkerSelection.nodeType);
}

/**
 * Autocomplete input for selecting a single modality-agnostic
 * item (e.g., a gene or pathway). Upon confirmation of the selection,
 * the item is transformed into the corresponding list of genes,
 * which is used as the featureSelection.
 * @param {object} props
 * @param {Function} props.setFeatureSelection
 * @param {Function} props.autocompleteNode
 * @param {Function} props.getEdges
 * @param {{ label: string, nodeType: string } | null} props.biomarkerSelection
 * The currently-selected item (e.g., from URL params).
 * @param {Function} props.setBiomarkerSelection
 * @param {object|null} props.resolvedBiomarker The full knowledge graph node
 * corresponding to the biomarkerSelection, once looked up.
 */
export function BiomarkerSelectAltGeneAutocomplete(props) {
  const {
    setFeatureSelection,
    autocompleteNode,
    getEdges,
    biomarkerSelection,
    setBiomarkerSelection,
    resolvedBiomarker,
  } = props;

  // An item that has been chosen in the autocomplete but not yet confirmed.
  const [pendingItem, setPendingItem] = useState(null);

  const [biomarkerInfoOpen, setBiomarkerInfoOpen] = useState(false);

  // The confirmed item. Prior to the lookup of the full node,
  // fall back to the label and nodeType (e.g., from URL params).
  const confirmedItem = isSameBiomarker(resolvedBiomarker, biomarkerSelection)
    ? resolvedBiomarker
    : biomarkerSelection;
  const displayedItem = pendingItem ?? confirmedItem ?? null;
  const hasPendingChange = Boolean(pendingItem)
    && !isSameBiomarker(pendingItem, biomarkerSelection);
  // The ontology term is needed to display the info dialog.
  const hasInfo = Boolean(displayedItem?.term);

  async function confirmPendingItem() {
    if (hasPendingChange) {
      const matchingGenes = await getEdges(pendingItem, 'gene');
      const nextFeatureSelection = uniqBy(matchingGenes, 'label').map(d => d.label);
      setBiomarkerSelection({ label: pendingItem.label, nodeType: pendingItem.nodeType });
      setFeatureSelection(nextFeatureSelection);
    }
    setPendingItem(null);
  }

  function clearBiomarkerSelection() {
    setPendingItem(null);
    setBiomarkerSelection(null);
    setFeatureSelection(null);
  }

  function handleChange(item) {
    if (item) {
      setPendingItem(item.data);
    } else {
      // The autocomplete input was cleared.
      clearBiomarkerSelection();
    }
  }

  return (
    <>
      <Grid container size={12}>
        <Grid size={8}>
          <SimpleAutocomplete
            value={displayedItem ? { label: displayedItem.label, data: displayedItem } : null}
            getMatches={autocompleteNode}
            onChange={handleChange}
            textInputLabel="Enter a gene"
            getItemLabel={item => `${item.label} (${item.data.nodeType})`}
          />
        </Grid>
        {hasPendingChange ? (
          <Grid size={4}>
            &nbsp;
            <Button
              variant="contained"
              onClick={confirmPendingItem}
            >
              Select
            </Button>
          </Grid>
        ) : null}
      </Grid>
      {hasInfo ? (
        <>
          <Grid
            container
            size={12}
            sx={{
              flexDirection: 'row',
            }}
          >
            <Button onClick={() => setBiomarkerInfoOpen(true)}>
              View {displayedItem.nodeType} info
            </Button>
          </Grid>
          <Dialog open={biomarkerInfoOpen} onClose={() => setBiomarkerInfoOpen(false)} maxWidth="md">
            <Typography variant="h4" title={displayedItem.term}>
              {displayedItem.label}
            </Typography>
            <Grid container size={12}>
              <InfoIcon />
              <Typography variant="h6">About this {displayedItem.nodeType}</Typography>
            </Grid>
            <Grid container size={12} key={displayedItem.term} sx={{ width: '800px' }}>
              <iframe
                title={`Embedded metadata page for ontology term ${displayedItem.term}`}
                src={`https://identifiers.org/${displayedItem.term}`}
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

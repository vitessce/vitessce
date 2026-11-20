import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { BiomarkerSelectAlt } from './BiomarkerSelectAlt.js';
import { transformFeature } from './default-async-functions.js';

vi.mock('@vitessce/styles', () => ({
  Grid: ({ children }) => <div>{children}</div>,
  Button: ({ children, onClick }) => <button type="button" onClick={onClick}>{children}</button>,
  Typography: ({ children }) => <span>{children}</span>,
  Dialog: () => null,
  Info: () => null,
  SimpleAutocomplete: ({ getMatches, onChange, value }) => (
    <>
      <span data-testid="autocomplete-value">{value ? `${value.label} (${value.data.nodeType})` : ''}</span>
      <button type="button" onClick={async () => onChange((await getMatches('pathway'))[0])}>
        Choose result
      </button>
      <button type="button" onClick={() => onChange(null)}>
        Clear
      </button>
    </>
  ),
}));
vi.mock('./styles.js', () => ({ useStyles: () => ({ classes: {} }) }));
vi.mock('./BiomarkerSelectAltSampleGroups.js', () => ({
  BiomarkerSelectAltSampleGroups: () => null,
}));

const geneA = { kgId: 'gene-a', label: 'GENE_A', nodeType: 'gene' };
const geneB = { kgId: 'gene-b', label: 'GENE_B', nodeType: 'gene' };
const pathway = { kgId: 'pathway', label: 'Example pathway', nodeType: 'pathway' };
const otherPathway = { kgId: 'other-pathway', label: 'Other pathway', nodeType: 'pathway' };

describe('BiomarkerSelectAlt', () => {
  it.each([
    ['pathway members', pathway, ['GENE_A', 'GENE_B']],
    ['a directly selected gene', geneA, ['GENE_A']],
    ['a pathway without members', { ...pathway, kgId: 'empty' }, []],
  ])('selects genes for %s', async (_name, selectedItem, expected) => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['geneNodes'], [geneA, geneB]);
    queryClient.setQueryData(['pathwayGeneEdges'], [
      { source: pathway.kgId, target: geneA.kgId },
      { source: pathway.kgId, target: geneB.kgId },
      { source: otherPathway.kgId, target: geneB.kgId },
    ]);
    const setFeatureSelection = vi.fn();
    const setBiomarkerSelection = vi.fn();

    render(
      <BiomarkerSelectAlt
        autocompleteNode={async () => [{ label: selectedItem.label, data: selectedItem }]}
        getEdges={(node, modality) => transformFeature({ queryClient }, node, modality)}
        biomarkerSelection={null}
        setBiomarkerSelection={setBiomarkerSelection}
        resolvedBiomarker={null}
        setFeatureSelection={setFeatureSelection}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Choose result' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Select' }));

    await waitFor(() => expect(setFeatureSelection).toHaveBeenCalledWith(expected));
    expect(setBiomarkerSelection).toHaveBeenCalledWith({
      label: selectedItem.label,
      nodeType: selectedItem.nodeType,
    });
    queryClient.clear();
  });

  it('displays the biomarkerSelection (e.g., from URL params) in the autocomplete', () => {
    render(
      <BiomarkerSelectAlt
        autocompleteNode={async () => []}
        getEdges={async () => []}
        biomarkerSelection={{ label: otherPathway.label, nodeType: 'pathway' }}
        setBiomarkerSelection={vi.fn()}
        resolvedBiomarker={null}
        setFeatureSelection={vi.fn()}
      />,
    );
    expect(screen.getByTestId('autocomplete-value').textContent).toEqual('Other pathway (pathway)');
    // The selection has already been confirmed.
    expect(screen.queryByRole('button', { name: 'Select' })).toBeNull();
  });

  it('clears the selection when the autocomplete is cleared', () => {
    const setFeatureSelection = vi.fn();
    const setBiomarkerSelection = vi.fn();
    render(
      <BiomarkerSelectAlt
        autocompleteNode={async () => []}
        getEdges={async () => []}
        biomarkerSelection={{ label: geneA.label, nodeType: 'gene' }}
        setBiomarkerSelection={setBiomarkerSelection}
        resolvedBiomarker={geneA}
        setFeatureSelection={setFeatureSelection}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(setBiomarkerSelection).toHaveBeenCalledWith(null);
    expect(setFeatureSelection).toHaveBeenCalledWith(null);
  });
});

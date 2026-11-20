import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BiomarkerSelectAltDatasetSelect } from './BiomarkerSelectAltDatasetSelect.js';

const datasetOptions = [
  { uid: 'sc-rna-seq', name: 'Single-cell RNA sequencing' },
  { uid: 'sn-rna-seq', name: 'Single-nucleus RNA sequencing' },
];

describe('BiomarkerSelectAltDatasetSelect', () => {
  it('renders nothing when fewer than two datasets are available', () => {
    const { container } = render(
      <BiomarkerSelectAltDatasetSelect
        datasetOptions={[datasetOptions[0]]}
        dataset="sc-rna-seq"
        setDataset={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a dropdown to switch between datasets', () => {
    const setDataset = vi.fn();
    render(
      <BiomarkerSelectAltDatasetSelect
        datasetOptions={datasetOptions}
        dataset="sc-rna-seq"
        setDataset={setDataset}
      />,
    );
    const select = screen.getByRole('combobox', { name: 'Select dataset' });
    expect(select).toHaveValue('sc-rna-seq');
    expect(screen.getByRole('option', { name: 'Single-nucleus RNA sequencing' })).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'sn-rna-seq' } });
    expect(setDataset).toHaveBeenCalledWith('sn-rna-seq');
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BiomarkerSelectAltDatasetSelect } from './BiomarkerSelectAltDatasetSelect.js';

const datasetOptions = [
  { uid: 'sc', name: 'Single-cell' },
  { uid: 'sn', name: 'Single-nucleus' },
];

describe('BiomarkerSelectAltDatasetSelect', () => {
  it('renders nothing when fewer than two datasets are available', () => {
    const { container } = render(
      <BiomarkerSelectAltDatasetSelect
        datasetOptions={[datasetOptions[0]]}
        dataset="sc"
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
        dataset="sc"
        setDataset={setDataset}
      />,
    );
    const select = screen.getByRole('combobox', { name: 'Select dataset' });
    expect(select).toHaveValue('sc');
    expect(screen.getByRole('option', { name: 'Single-nucleus' })).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'sn' } });
    expect(setDataset).toHaveBeenCalledWith('sn');
  });
});

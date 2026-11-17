import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BiomarkerSelectAltSampleGroups } from './BiomarkerSelectAltSampleGroups.js';

vi.mock('@vitessce/styles', () => ({
  Grid: ({ children }) => <div>{children}</div>,
  NativeSelect: ({ children, value, onChange }) => (
    <select value={value} onChange={onChange}>{children}</select>
  ),
}));

const stratifications = [
  {
    stratificationId: 'ec_hr-vs-aki',
    name: 'Enrollment Category: Healthy Reference vs. AKI',
    stratificationType: 'sampleSet',
    sampleSets: [
      ['Enrollment Category', 'Healthy Reference'],
      ['Enrollment Category', 'AKI'],
    ],
  },
  {
    stratificationId: 'ec_hr-vs-ckd',
    name: 'Enrollment Category: Healthy Reference vs. CKD',
    stratificationType: 'sampleSet',
    sampleSets: [
      ['Enrollment Category', 'Healthy Reference'],
      ['Enrollment Category', 'CKD'],
    ],
  },
];

function renderSampleGroups(sampleSetSelection) {
  const setSampleSetFilter = vi.fn();
  const setSampleSetSelection = vi.fn();
  render(
    <BiomarkerSelectAltSampleGroups
      setSampleSetFilter={setSampleSetFilter}
      setSampleSetSelection={setSampleSetSelection}
      sampleSetSelection={sampleSetSelection}
      stratifications={stratifications}
    />,
  );
  const [lhsSelect, rhsSelect] = screen.getAllByRole('combobox');
  return {
    lhsSelect, rhsSelect, setSampleSetFilter, setSampleSetSelection,
  };
}

describe('BiomarkerSelectAltSampleGroups', () => {
  it('defaults to All/None when there is no sampleSetSelection', () => {
    const { lhsSelect, rhsSelect } = renderSampleGroups(null);
    expect(lhsSelect.value).toEqual('__all__');
    expect(rhsSelect.value).toEqual('__none__');
  });

  it('reflects an initial sampleSetSelection with two groups', () => {
    const { lhsSelect, rhsSelect } = renderSampleGroups([
      ['Enrollment Category', 'Healthy Reference'],
      ['Enrollment Category', 'CKD'],
    ]);
    expect(lhsSelect.value).toEqual('Enrollment Category: Healthy Reference');
    expect(rhsSelect.value).toEqual('Enrollment Category: CKD');
  });

  it('reflects an initial sampleSetSelection with one group', () => {
    const { lhsSelect, rhsSelect } = renderSampleGroups([
      ['Enrollment Category', 'Healthy Reference'],
    ]);
    expect(lhsSelect.value).toEqual('Enrollment Category: Healthy Reference');
    expect(rhsSelect.value).toEqual('__none__');
  });

  it('falls back to All/None when the sampleSetSelection does not match an option', () => {
    const { lhsSelect, rhsSelect } = renderSampleGroups([
      ['Enrollment Category', 'Unknown'],
      ['Enrollment Category', 'CKD'],
    ]);
    expect(lhsSelect.value).toEqual('__all__');
    expect(rhsSelect.value).toEqual('__none__');
  });

  it('calls the setters upon selecting a second group', () => {
    const {
      rhsSelect, setSampleSetFilter, setSampleSetSelection,
    } = renderSampleGroups([
      ['Enrollment Category', 'Healthy Reference'],
    ]);
    fireEvent.change(rhsSelect, { target: { value: 'Enrollment Category: AKI' } });
    const expected = [
      ['Enrollment Category', 'Healthy Reference'],
      ['Enrollment Category', 'AKI'],
    ];
    expect(setSampleSetFilter).toHaveBeenCalledWith(expected);
    expect(setSampleSetSelection).toHaveBeenCalledWith(expected);
  });
});

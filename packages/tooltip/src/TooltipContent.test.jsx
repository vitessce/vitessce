import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MISSING_VALUE_PLACEHOLDER } from '@vitessce/utils';

import TooltipContent from './TooltipContent.js';

describe('TooltipContent.js', () => {
  it('renders the shared placeholder for a missing value', async () => {
    // An observation whose categorical label is missing has an undefined set name;
    // the sets manager shows the placeholder for it, so the tooltip must too.
    render(<TooltipContent info={{ 'Cell ID': 'cell_1', 'Azimuth Label': undefined, Leiden: '3' }} />);
    expect(await screen.findByText('cell_1'));
    expect(await screen.findByText('Azimuth Label'));
    expect(await screen.findByText(MISSING_VALUE_PLACEHOLDER));
    expect(await screen.findByText('3'));
  });

  it('keeps legitimate falsy values', async () => {
    render(<TooltipContent info={{ Count: 0, Flag: false }} />);
    expect(await screen.findByText('0'));
    expect(screen.queryByText(MISSING_VALUE_PLACEHOLDER)).toBeNull();
  });
});

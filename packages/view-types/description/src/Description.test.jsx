import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';

import Description from './Description.js';

afterEach(() => {
  cleanup();
});

describe('Description.js', () => {
  describe('<Description />', () => {
    it('shows text', async () => {
      render(<Description description="Some text" />);
      expect(await screen.findByText('Some text'));
    });

    it('shows metadata', async () => {
      const layerIndex = '0';
      const layerName = 'My layer';
      const metadata = new Map([
        [layerIndex, {
          name: layerName,
          metadata: {
            Channels: 4,
            'Pixels Type': 'uint16',
          },
        }],
      ]);
      render(<Description metadata={metadata} />);
      expect(await screen.findByText('My layer'));
      expect(await screen.findByText('Channels'));
      expect(await screen.findByText('4'));
      expect(await screen.findByText('Pixels Type'));
      expect(await screen.findByText('uint16'));
    });
  });
});

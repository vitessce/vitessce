/* eslint-disable func-names */
import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';

import Heatmap from './Heatmap.js';
import { expressionMatrix, cellColors } from './Heatmap.test.fixtures.js';

afterEach(() => {
  cleanup();
});

describe('<Heatmap/>', () => {
  it('renders a DeckGL element', () => {
    const { container } = render(
      <Heatmap
        uuid="heatmap-0"
        theme="dark"
        width={100}
        height={100}
        colormap="plasma"
        colormapRange={[0.0, 1.0]}
        expressionMatrix={expressionMatrix}
        cellColors={cellColors}
        transpose
        viewState={{ zoom: 0, target: [0, 0] }}
      />,
    );
    expect(container.querySelectorAll('#deckgl-overlay-heatmap-0-wrapper').length).toEqual(1);
  });
});

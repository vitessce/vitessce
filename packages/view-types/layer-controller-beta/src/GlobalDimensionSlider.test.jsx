import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import GlobalDimensionSlider from './GlobalDimensionSlider.js';


function renderZSlider(props) {
  return render(
    <GlobalDimensionSlider
      label="Z"
      targetValue={0}
      setTargetValue={() => {}}
      max={10}
      spatialRenderingMode="2D"
      setSpatialRenderingMode={() => {}}
      {...props}
    />,
  );
}

describe('GlobalDimensionSlider.js', () => {
  describe('<GlobalDimensionSlider />', () => {
    it('offers the 3D switch by default', async () => {
      renderZSlider();
      expect(await screen.findByRole('checkbox', { name: '3D' })).toBeDefined();
    });

    it('withholds the 3D switch when a config disables 3D', () => {
      renderZSlider({ enable3d: false });
      expect(screen.queryByRole('checkbox', { name: '3D' })).toBeNull();
      // The Z-slice slider itself must survive.
      expect(screen.queryByLabelText('Z-slice slider')).not.toBeNull();
    });

    it('has no 3D switch on a non-Z dimension', () => {
      // T sliders are rendered without a rendering mode, which is what marks them as not-Z.
      render(
        <GlobalDimensionSlider
          label="T"
          targetValue={0}
          setTargetValue={() => {}}
          max={3}
        />,
      );
      expect(screen.queryByRole('checkbox', { name: '3D' })).toBeNull();
    });
  });
});

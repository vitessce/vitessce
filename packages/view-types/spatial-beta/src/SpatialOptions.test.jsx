import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import SpatialOptions from './SpatialOptions.js';

const LABEL = 'Fix or not fix spatial camera axis';

describe('SpatialOptions.js', () => {
  describe('<SpatialOptions />', () => {
    it('renders a labelled checkbox reflecting spatialAxisFixed', async () => {
      render(<SpatialOptions spatialAxisFixed use3d setSpatialAxisFixed={() => {}} />);
      expect(await screen.findByText('Fix Camera Axis'));
      expect(screen.getByLabelText(LABEL).checked).toBe(true);
    });

    it('is unchecked when spatialAxisFixed is unset', () => {
      render(<SpatialOptions
        spatialAxisFixed={null}
        use3d
        setSpatialAxisFixed={() => {}}
      />);
      expect(screen.getByLabelText(LABEL).checked).toBe(false);
    });

    it('sets the coordination value on toggle', () => {
      const setSpatialAxisFixed = vi.fn();
      render(<SpatialOptions
        spatialAxisFixed={false}
        use3d
        setSpatialAxisFixed={setSpatialAxisFixed}
      />);
      fireEvent.click(screen.getByLabelText(LABEL));
      expect(setSpatialAxisFixed).toHaveBeenCalledWith(true);
    });

    it('is disabled outside of 3D, where the camera axis is meaningless', () => {
      render(<SpatialOptions
        spatialAxisFixed={false}
        use3d={false}
        setSpatialAxisFixed={() => {}}
      />);
      expect(screen.getByLabelText(LABEL).disabled).toBe(true);
    });
  });
});

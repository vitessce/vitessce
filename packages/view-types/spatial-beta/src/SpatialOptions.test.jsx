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

    describe('volume loading options', () => {
      const MAX_LABEL = 'Maximum number of volume bricks fetched at once';
      const PROGRESSIVE_LABEL = 'Load coarser volume resolutions before finer ones';
      function renderOptions(props = {}) {
        render(<SpatialOptions
          spatialAxisFixed={false}
          use3d
          setSpatialAxisFixed={() => {}}
          hasVolumeLoadingOptions
          volumeMaxConcurrentBrickRequests={10}
          setVolumeMaxConcurrentBrickRequests={() => {}}
          volumeProgressiveLoading={false}
          setVolumeProgressiveLoading={() => {}}
          {...props}
        />);
      }

      it('are shown only for the accelerated 3D view', () => {
        renderOptions({ hasVolumeLoadingOptions: false });
        expect(screen.queryByLabelText(MAX_LABEL)).toBeNull();
        expect(screen.queryByLabelText(PROGRESSIVE_LABEL)).toBeNull();
      });

      it('reflect the current values', () => {
        renderOptions({ volumeProgressiveLoading: true });
        expect(screen.getByLabelText(MAX_LABEL).value).toBe('10');
        expect(screen.getByLabelText(PROGRESSIVE_LABEL).checked).toBe(true);
      });

      it('set the maximum number of concurrent brick requests, including no limit', () => {
        const setMax = vi.fn();
        renderOptions({ setVolumeMaxConcurrentBrickRequests: setMax });
        fireEvent.change(screen.getByLabelText(MAX_LABEL), { target: { value: '32' } });
        expect(setMax).toHaveBeenLastCalledWith(32);
        fireEvent.change(screen.getByLabelText(MAX_LABEL), { target: { value: 'Infinity' } });
        expect(setMax).toHaveBeenLastCalledWith(Infinity);
        expect(screen.getByText('No limit')).toBeTruthy();
      });

      it('offer a maximum set by the view config that is not among the choices', () => {
        renderOptions({ volumeMaxConcurrentBrickRequests: 12 });
        expect(screen.getByLabelText(MAX_LABEL).value).toBe('12');
      });

      it('toggle progressive loading', () => {
        const setProgressive = vi.fn();
        renderOptions({ setVolumeProgressiveLoading: setProgressive });
        fireEvent.click(screen.getByLabelText(PROGRESSIVE_LABEL));
        expect(setProgressive).toHaveBeenCalledWith(true);
      });

      it('are disabled outside of 3D', () => {
        renderOptions({ use3d: false });
        expect(screen.getByLabelText(MAX_LABEL).disabled).toBe(true);
        expect(screen.getByLabelText(PROGRESSIVE_LABEL).disabled).toBe(true);
      });
    });
  });
});

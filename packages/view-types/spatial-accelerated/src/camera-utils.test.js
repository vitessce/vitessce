import { describe, it, expect } from 'vitest';
import {
  viewStateToCamera,
  cameraToViewState,
  isVolumeViewState,
  roundViewState,
  DEFAULT_VOLUME_VIEW_STATE,
} from './camera-utils.js';

const toVector = ([x, y, z]) => ({ x, y, z });

describe('camera utils', () => {
  it('places the default camera in front of the volume', () => {
    const { position, target } = viewStateToCamera(DEFAULT_VOLUME_VIEW_STATE);
    // cos(90°) is not exactly 0 in floating point.
    [0, 0, 4].forEach((value, axis) => {
      expect(position[axis]).toBeCloseTo(value);
    });
    expect(target).toEqual([0, 0, 0]);
  });

  it('converts a camera back to the same viewState', () => {
    const viewState = {
      zoom: 0.75, target: [0.1, -0.2, 0.05], rotationX: -30, rotationOrbit: 120,
    };
    const { position, target } = viewStateToCamera(viewState);
    const result = cameraToViewState(toVector(position), toVector(target));
    expect(result.zoom).toBeCloseTo(viewState.zoom);
    expect(result.rotationX).toBeCloseTo(viewState.rotationX);
    expect(result.rotationOrbit).toBeCloseTo(viewState.rotationOrbit);
    result.target.forEach((value, axis) => {
      expect(value).toBeCloseTo(viewState.target[axis]);
    });
  });

  describe('isVolumeViewState', () => {
    const boxExtent = [1, 0.76, 0.3];

    it('accepts a camera near the volume', () => {
      expect(isVolumeViewState(DEFAULT_VOLUME_VIEW_STATE, boxExtent)).toBe(true);
      expect(isVolumeViewState({
        zoom: -1, target: [0.5, -0.5, 0.2], rotationX: 10, rotationOrbit: 0,
      }, boxExtent)).toBe(true);
    });

    it('rejects the Deck.gl default camera of a large image', () => {
      // Centered on a 15921 x 12177 image (2 µm pixels), zoomed out.
      expect(isVolumeViewState({
        zoom: -5.2, target: [15921, 12177, 2448], rotationX: 0, rotationOrbit: 0,
      }, boxExtent)).toBe(false);
    });

    it('rejects a camera beyond the far plane', () => {
      expect(isVolumeViewState({ ...DEFAULT_VOLUME_VIEW_STATE, zoom: -2 }, boxExtent)).toBe(false);
    });

    it('rejects missing values', () => {
      expect(isVolumeViewState(null, boxExtent)).toBe(false);
      const withoutRotation = { ...DEFAULT_VOLUME_VIEW_STATE, rotationX: null };
      const withTargetXY = { ...DEFAULT_VOLUME_VIEW_STATE, target: [0, 0] };
      expect(isVolumeViewState(withoutRotation, boxExtent)).toBe(false);
      expect(isVolumeViewState(withTargetXY, boxExtent)).toBe(false);
    });
  });

  it('rounds a viewState for a view config', () => {
    expect(roundViewState({
      zoom: 0.123456, target: [-0.00001, 0.5, 1 / 3], rotationX: -12.34567, rotationOrbit: 90,
    })).toEqual({
      zoom: 0.123, target: [0, 0.5, 0.333], rotationX: -12.346, rotationOrbit: 90,
    });
  });
});

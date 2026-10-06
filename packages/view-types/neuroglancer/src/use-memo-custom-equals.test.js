import { describe, it, expect } from 'vitest';
import { customIsEqualForInitialViewerState } from './use-memo-custom-equals.js';

// Shared references so shallowDiff on top-level deps sees no change;
// only the per-layer coordination differs between prev and next.
const SHARED_DEPS = {
  theme: 'dark',
  showAxisLines: false,
  segmentationLayerScopes: [],
  segmentationChannelScopesByLayer: {},
  pointLayerScopes: ['A'],
  obsPointsData: {},
  pointMultiIndicesData: {},
};


const makeDeps = layer => ({
  ...SHARED_DEPS,
  pointLayerCoordination: [{ A: layer }],
});

describe('customIsEqualForInitialViewerState point opacity', () => {
  it('is equal for small spatialLayerOpacity changes', () => {
    expect(customIsEqualForInitialViewerState(
      makeDeps({ spatialLayerOpacity: 1.0 }),
      makeDeps({ spatialLayerOpacity: 0.98 }),
    )).toBe(true);
  });

  it('is not equal when spatialLayerOpacity changes by >= 0.05', () => {
    expect(customIsEqualForInitialViewerState(
      makeDeps({ spatialLayerOpacity: 1.0 }),
      makeDeps({ spatialLayerOpacity: 0.9 }),
    )).toBe(false);
  });

  it('is not equal when spatialLayerOpacityUnselected changes by >= 0.05', () => {
    expect(customIsEqualForInitialViewerState(
      makeDeps({ spatialLayerOpacityUnselected: 0.25 }),
      makeDeps({ spatialLayerOpacityUnselected: 0.1 }),
    )).toBe(false);
  });

  it('treats undefined unselected opacity as the 0.25 default', () => {
    expect(customIsEqualForInitialViewerState(
      makeDeps({}),
      makeDeps({ spatialLayerOpacityUnselected: 0.25 }),
    )).toBe(true);
  });
});

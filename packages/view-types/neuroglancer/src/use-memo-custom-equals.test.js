import { describe, it, expect } from 'vitest';
import { customIsEqualForInitialViewerState } from './use-memo-custom-equals.js';

const makeDeps = layer => ({
  theme: 'dark',
  showAxisLines: false,
  segmentationLayerScopes: [],
  segmentationChannelScopesByLayer: {},
  pointLayerScopes: ['A'],
  pointLayerCoordination: [{ A: layer }],
  obsPointsData: {},
  pointMultiIndicesData: {},
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

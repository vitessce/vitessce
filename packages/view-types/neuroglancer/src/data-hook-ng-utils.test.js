import { describe, it, expect } from 'vitest';
import { classifyPointLayers,
  DEFAULT_NG_PROPS,
  sanitizeNgCameraState,
} from './data-hook-ng-utils.js';

describe('classifyPointLayers', () => {
  const segmentationLayerScopes = ['segA', 'segB'];
  const segmentationChannelScopesByLayer = { segA: ['ch0'], segB: ['ch0'] };
  const segmentationChannelCoordination = [{
    segA: { ch0: { obsType: 'cell' } },
    segB: { ch0: { obsType: 'nucleus' } },
  }];

  it('separates centroid layers from transcript layers by obsType', () => {
    const roles = classifyPointLayers({
      pointLayerScopes: ['cells', 'nuclei', 'tx'],
      pointLayerCoordination: [{
        cells: { obsType: 'cell' },
        nuclei: { obsType: 'nucleus' },
        tx: { obsType: 'transcript' },
      }],
      segmentationLayerScopes,
      segmentationChannelScopesByLayer,
      segmentationChannelCoordination,
    });
    expect(roles.centroidScopes).toEqual(['cells', 'nuclei']);
    expect(roles.transcriptScopes).toEqual(['tx']);
    expect(roles.centroidToSegLayers).toEqual({ cells: ['segA'], nuclei: ['segB'] });
    expect([...roles.culledSegLayerScopes].sort()).toEqual(['segA', 'segB']);
  });

  it('treats all point layers as transcripts when there are no segmentations', () => {
    const roles = classifyPointLayers({
      pointLayerScopes: ['tx1', 'tx2'],
      pointLayerCoordination: [{ tx1: { obsType: 'transcript' }, tx2: { obsType: 'transcript' } }],
      segmentationLayerScopes: [],
      segmentationChannelScopesByLayer: {},
      segmentationChannelCoordination: [{}],
    });
    expect(roles.centroidScopes).toEqual([]);
    expect(roles.transcriptScopes).toEqual(['tx1', 'tx2']);
    expect(roles.culledSegLayerScopes.size).toBe(0);
  });
});

describe('sanitizeNgCameraState', () => {
  it('keeps valid fields as-is', () => {
    const cam = {
      position: [1, 2, 3],
      projectionOrientation: [0.1, 0.2, 0.3, 0.9],
      projectionScale: 2700000,
    };
    expect(sanitizeNgCameraState(cam)).toEqual(cam);
  });

  it('replaces invalid orientation/scales with defaults and drops invalid position', () => {
    expect(sanitizeNgCameraState({
      position: [],
      projectionOrientation: [],
      projectionScale: -1,
      crossSectionScale: Number.NaN,
    })).toEqual({
      projectionOrientation: DEFAULT_NG_PROPS.projectionOrientation,
      projectionScale: DEFAULT_NG_PROPS.projectionScale,
      crossSectionScale: DEFAULT_NG_PROPS.crossSectionScale,
    });
  });

  it('uses caller-provided fallbacks', () => {
    expect(sanitizeNgCameraState(
      { projectionOrientation: [0, 0, 0, 0] },
      { projectionOrientation: [1, 0, 0, 0] },
    )).toEqual({ projectionOrientation: [1, 0, 0, 0] });
  });

  it('returns {} for missing input and skips undefined values', () => {
    expect(sanitizeNgCameraState(undefined)).toEqual({});
    expect(sanitizeNgCameraState({ foo: undefined })).toEqual({});
  });
});

import { describe, it, expect } from 'vitest';
import { classifyPointLayers } from './data-hook-ng-utils.js';

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

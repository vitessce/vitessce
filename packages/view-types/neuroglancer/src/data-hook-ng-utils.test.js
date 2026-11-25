import { describe, it, expect } from 'vitest';
import {
  getSegmentationCentroidSources,
  getCentroidShaderParams,
  resolveViewerDimensions,
  DEFAULT_NG_DIMENSIONS,
  DEFAULT_NG_PROPS,
  sanitizeNgCameraState,
} from './data-hook-ng-utils.js';
import { getPointsShader } from './shader-utils.js';

describe('getSegmentationCentroidSources', () => {
  const ngLocations = url => ({
    obsIndex: null,
    obsLocations: null,
    obsLocationsTilingType: 'neuroglancer',
    neuroglancerOptions: { segmentIdProp: 'mesh_id' },
    neuroglancerInfo: { lower_bound: [0, 0, 0], upper_bound: [1, 1, 1] },
    neuroglancerUrl: url,
  });

  it('returns one source per segmentation channel with Neuroglancer obsLocations', () => {
    const sources = getSegmentationCentroidSources({
      segmentationLayerScopes: ['segA', 'segB'],
      segmentationChannelScopesByLayer: { segA: ['ch0'], segB: ['ch0'] },
      obsSegmentationsLocationsData: {
        segA: { ch0: ngLocations('https://example.com/cells') },
        // e.g., no obsLocations file for this obsType.
        segB: { ch0: null },
      },
    });
    expect(sources).toEqual([{
      layerScope: 'segA',
      channelScope: 'ch0',
      name: 'obsLocations-segA-ch0',
      url: 'https://example.com/cells',
      neuroglancerOptions: { segmentIdProp: 'mesh_id' },
      neuroglancerInfo: { lower_bound: [0, 0, 0], upper_bound: [1, 1, 1] },
    }]);
  });

  it('ignores obsLocations from non-Neuroglancer file types', () => {
    const sources = getSegmentationCentroidSources({
      segmentationLayerScopes: ['segA'],
      segmentationChannelScopesByLayer: { segA: ['ch0'] },
      obsSegmentationsLocationsData: {
        segA: { ch0: { obsIndex: ['1'], obsLocations: { data: [[0], [0]] } } },
      },
    });
    expect(sources).toEqual([]);
  });

  it('returns an empty array when there are no segmentations', () => {
    expect(getSegmentationCentroidSources({
      segmentationLayerScopes: [],
      segmentationChannelScopesByLayer: {},
      obsSegmentationsLocationsData: {},
    })).toEqual([]);
  });
});

describe('getCentroidShaderParams', () => {
  it('derives the shader parameters from the segmentation layer/channel', () => {
    const params = getCentroidShaderParams(
      { spatialLayerOpacity: 0.5 },
      {
        spatialChannelOpacity: 0.5,
        spatialChannelColor: [255, 0, 0],
        obsColorEncoding: 'spatialChannelColor',
      },
    );
    expect(params.spatialLayerOpacity).toBe(0.25);
    expect(params.obsColorEncoding).toBe('spatialLayerColor');
    expect(params.spatialLayerColor).toEqual([255, 0, 0]);
    expect(params.pointsAreSegmentationCentroids).toBe(true);
  });

  it('passes other color encodings through', () => {
    const params = getCentroidShaderParams({}, {
      obsColorEncoding: 'geneSelection',
      featureValueColormap: 'plasma',
      featureValueColormapRange: [0, 1],
    });
    expect(params.spatialLayerOpacity).toBe(1.0);
    expect(params.obsColorEncoding).toBe('geneSelection');
    expect(params.featureValueColormap).toBe('plasma');
    expect(params.featureValueColormapRange).toEqual([0, 1]);
        // Non-obsSet encodings keep showing only the selected features.
    expect(params.featureFilterMode).toBe('featureSelection');
  });

  it('draws unselected obsSet centroids unless "Hide unselected" is on, as for meshes', () => {
    const shown = getCentroidShaderParams({}, {
      obsColorEncoding: 'cellSetSelection', spatialLayerOpacityUnselected: 0.25,
    });
    expect(shown.featureFilterMode).toBe(null);
    expect(shown.spatialLayerOpacityUnselected).toBe(1.0);
    // Unset unselected opacity behaves like the meshes (shown, grey).
    expect(getCentroidShaderParams({}, { obsColorEncoding: 'cellSetSelection' })
      .featureFilterMode).toBe(null);

    const hidden = getCentroidShaderParams({}, {
      obsColorEncoding: 'cellSetSelection', spatialLayerOpacityUnselected: 0,
    });
    expect(hidden.featureFilterMode).toBe('featureSelection');
    expect(hidden.spatialLayerOpacityUnselected).toBe(undefined);
  });

  it('yields a shader that keeps (grey) or discards unselected obsSet centroids', () => {
    const obsSetRules = [{ prop: 'phenotype', codes: [3], color: [255, 0, 0] }];
    const shaderFor = spatialLayerOpacityUnselected => getPointsShader({
      theme: 'dark',
      ...getCentroidShaderParams({}, {
        obsColorEncoding: 'cellSetSelection', spatialLayerOpacityUnselected,
      }),
      obsSetRules,
    });
    const shown = shaderFor(0.25);
    expect(shown).not.toContain('discard');
    // Unselected: default dark-theme grey [50, 50, 50], full opacity.
    expect(shown).toContain('isSelected ? 1.0000 : 1.0000');
    expect(shaderFor(0)).toContain('if (!isSelected) { discard; }');
    // Empty selection: all grey vs. all hidden.
    const emptyFor = v => getPointsShader({
      theme: 'dark',
      ...getCentroidShaderParams({}, {
        obsColorEncoding: 'cellSetSelection', spatialLayerOpacityUnselected: v,
      }),
      obsSetRules: [],
    });
    expect(emptyFor(0.25)).not.toContain('discard');
    expect(emptyFor(0)).toBe('void main() { discard; }');
  });
});

describe('resolveViewerDimensions', () => {
  const um = { x: [1e-6, 'm'], y: [1e-6, 'm'], z: [1e-6, 'm'] };
  const nm = { x: [1e-9, 'm'], y: [1e-9, 'm'], z: [1e-9, 'm'] };

  it('uses the first annotation source that declares outputDimensions', () => {
    expect(resolveViewerDimensions([
      { name: 'obsPoints-A', neuroglancerOptions: {} },
      { name: 'obsLocations-B-C', neuroglancerOptions: { transform: { outputDimensions: um } } },
      { name: 'obsPoints-D', neuroglancerOptions: { transform: { outputDimensions: nm } } },
    ])).toEqual(um);
  });

  it('prefers a valid override and falls back to the default', () => {
    const sources = [{ name: 'obsPoints-A', neuroglancerOptions: { transform: { outputDimensions: um } } }];
    expect(resolveViewerDimensions(sources, nm)).toEqual(nm);
    expect(resolveViewerDimensions([], null)).toEqual(DEFAULT_NG_DIMENSIONS);
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

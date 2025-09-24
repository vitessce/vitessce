import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  extractDataTypeEntities,
  DEFAULT_NG_PROPS,
} from './data-hook-ng-utils.js';

describe('extractDataTypeEntities (minimal tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when internMap is missing or invalid', () => {
    expect(extractDataTypeEntities({}, 'A', 'obsSegmentations')).toEqual([]);

    expect(
      extractDataTypeEntities({ A: { loaders: {} } }, 'A', 'obsSegmentations'),
    ).toEqual([]);

    expect(
      extractDataTypeEntities({ A: { loaders: { obsSegmentations: {} } } }, 'A', 'obsSegmentations'),
    ).toEqual([]);
  });

  it('builds an entity for a precomputed loader and applies sane defaults', () => {
    const key = { fileUid: 'melanom-meshes' };
    const loader = {
      fileType: 'obsSegmentations.ng-precomputed',
      url: 'https://www.example.com/example/example_meshes',
      options: { projectionScale: 2048 },
    };
    const internMap = new Map([[key, loader]]);
    const loaders = { A: { loaders: { obsSegmentations: internMap } } };

    const out = extractDataTypeEntities(loaders, 'A', 'obsSegmentations');
    expect(out).toHaveLength(1);

    const e = out[0];
    expect(e.key).toBe(key);
    expect(e.type).toBe('segmentation');
    expect(e.fileUid).toBe('melanom-meshes');
    expect(e.layout).toBe(DEFAULT_NG_PROPS.layout);

    // URL + source prefixing
    expect(e.url).toBe(loader.url);
    expect(e.source).toBe(`precomputed://${loader.url}`);

    expect(e.dimensions).toEqual({ x: [1, 'nm'], y: [1, 'nm'], z: [1, 'nm'] });

    // camera defaults + single override
    expect(e.position).toEqual(DEFAULT_NG_PROPS.position);
    expect(e.projectionOrientation).toEqual(DEFAULT_NG_PROPS.projectionOrientation);
    expect(e.projectionScale).toBe(2048);
    expect(e.crossSectionScale).toBe(DEFAULT_NG_PROPS.crossSectionScale);
  });
});

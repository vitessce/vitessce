import { describe, it, expect } from 'vitest';
import { getVolumeSources } from './volume-sources.js';
import { createZarrRegionReader } from './volume-zarr.js';
import { createTiffRegionReader } from './volume-tiff.js';

// Mimics an ImageWrapper, whose getResolutionLevels is tested in @vitessce/image-utils.
function createMockWrapper(type, levels, { isInterleaved = false } = {}) {
  return {
    getType: () => type,
    isInterleaved: () => isInterleaved,
    getResolutionLevels: async () => levels,
  };
}

describe('getVolumeSources', () => {
  const labels = ['t', 'c', 'z', 'y', 'x'];

  it('reads OME-TIFF levels tile by tile', async () => {
    const levels = [{
      labels,
      dtype: 'Uint16',
      shape: [1, 3, 401, 4255, 4992],
      chunks: [1, 1, 1, 512, 512],
      data: { labels },
    }];
    const sources = await getVolumeSources(createMockWrapper('ome-tiff', levels));
    expect(sources).toEqual({
      labels, dtype: 'Uint16', arrays: levels, createRegionReader: createTiffRegionReader,
    });
  });

  it('reads OME-Zarr levels through their zarrita arrays', async () => {
    const levels = [{
      labels,
      dtype: 'Uint16',
      shape: [1, 1, 32, 32, 32],
      chunks: [1, 1, 32, 32, 32],
      scale: [1, 1, 2, 0.5, 0.5],
      data: {},
    }];
    const sources = await getVolumeSources(createMockWrapper('ome-zarr', levels));
    expect(sources.arrays).toBe(levels);
    expect(sources.dtype).toBe('Uint16');
    expect(sources.createRegionReader).toBe(createZarrRegionReader);
  });

  it('rejects interleaved RGB images', async () => {
    const wrapper = createMockWrapper('ome-tiff', [], { isInterleaved: true });
    await expect(getVolumeSources(wrapper)).rejects.toThrow(/Interleaved/);
  });

  it('rejects other image types', async () => {
    await expect(getVolumeSources(undefined)).rejects.toThrow(/OME-Zarr or OME-TIFF/);
  });
});

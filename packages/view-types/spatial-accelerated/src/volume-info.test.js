import { describe, it, expect } from 'vitest';
import {
  getVolumeInfo, formatBytes, formatExtent, formatDtype, formatRangeWarning,
  formatChunkWarning,
} from './volume-info.js';

describe('volume info', () => {
  describe('getVolumeInfo', () => {
    // An XY-only TIFF pyramid (TCZYX): Z is reduced on the fly at level 1.
    // Three timepoints, of which the view shows one.
    const labels = ['t', 'c', 'z', 'y', 'x'];
    const sourceArrays = [
      { shape: [3, 4, 64, 2048, 1024], chunks: [1, 1, 1, 512, 512], dtype: 'Uint16' },
      { shape: [3, 4, 64, 1024, 512], chunks: [1, 1, 1, 512, 512], dtype: 'Uint16' },
      { shape: [3, 4, 64, 512, 256], chunks: [1, 1, 1, 256, 256], dtype: 'Uint16' },
    ];

    it('describes every source level, and render levels by their source', () => {
      const info = getVolumeInfo({
        sourceArrays,
        labels,
        // Planned from source 1 on: source 0 is too large.
        levels: [
          { source: 0, dataShape: [64, 1024, 512], zFactor: 1, zMode: 'sample' },
          { source: 1, dataShape: [32, 512, 256], zFactor: 2, zMode: 'sample' },
        ],
        firstSource: 1,
        maxShape: [4096, 1024, 1024],
        spacing: [2, 0.5, 0.5],
        spacingUnit: 'micrometer',
      });
      expect(info.dtype).toBe('uint16');
      expect(info.channelCount).toBe(4);
      expect(info.spacingUnit).toBe('µm');
      expect(info.sourceLevels.map(level => level.isRendered)).toEqual([false, true, true]);
      // Source 0 is 2048 voxels high; every source is 64 planes deep.
      expect(info.sourceLevels.map(level => level.isOverMaxXY)).toEqual([true, false, false]);
      expect(info.sourceLevels.map(level => level.isOverMaxZ)).toEqual([false, false, false]);
      expect(info.sourceLevels[0].shape).toEqual([64, 2048, 1024]);
      expect(info.sourceLevels[0].chunks).toEqual([1, 512, 512]);
      // One timepoint, 2 bytes per voxel: one channel, and all four.
      expect(info.sourceLevels[0].channelBytes).toBe(64 * 2048 * 1024 * 2);
      expect(info.sourceLevels[0].bytes).toBe(4 * 64 * 2048 * 1024 * 2);
      expect(info.renderLevels.map(level => level.source)).toEqual([1, 2]);
      expect(info.renderLevels[1]).toMatchObject({ shape: [32, 512, 256], zFactor: 2 });
    });

    it('treats missing axes as size 1', () => {
      const info = getVolumeInfo({
        sourceArrays: [{ shape: [512, 64, 64], chunks: [256, 32, 32], dtype: 'uint8' }],
        labels: ['z', 'y', 'x'],
        levels: [{ source: 0, dataShape: [512, 64, 64], zFactor: 1, zMode: 'sample' }],
        firstSource: 0,
        spacing: [1, 1, 1],
      });
      expect(info.channelCount).toBe(1);
      expect(info.spacingUnit).toBe('');
      expect(info.sourceLevels[0].bytes).toBe(512 * 64 * 64);
      expect(info.sourceLevels[0].isOverMaxZ).toBe(false);
    });

    it('flags a source deeper than the limit', () => {
      const info = getVolumeInfo({
        sourceArrays: [{ shape: [5000, 64, 64], chunks: [1, 64, 64], dtype: 'uint8' }],
        labels: ['z', 'y', 'x'],
        levels: [{ source: 0, dataShape: [2500, 64, 64], zFactor: 2, zMode: 'sample' }],
        firstSource: 0,
        maxShape: [4096, 16384, 16384],
        spacing: [1, 1, 1],
      });
      expect(info.sourceLevels[0]).toMatchObject({ isOverMaxXY: false, isOverMaxZ: true });
      expect(info.renderLevels[0]).toMatchObject({ source: 0, zFactor: 2 });
    });
  });

  it('formats sizes and extents', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1.5 * (2 ** 20))).toBe('1.5 MB');
    expect(formatBytes(2048 * 2048 * 1920)).toBe('7.5 GB');
    expect(formatExtent([1920, 2048, 1024])).toBe('1024 × 2048 × 1920');
  });

  it('names dtypes from zarrita, Zarr v2 codes and viv the same way', () => {
    expect(formatDtype('<u2')).toBe('uint16');
    expect(formatDtype('|u1')).toBe('uint8');
    expect(formatDtype('<f4')).toBe('float32');
    expect(formatDtype('>i2')).toBe('int16');
    expect(formatDtype('Uint16')).toBe('uint16');
    expect(formatDtype('float32')).toBe('float32');
  });

  it('warns about channels without a value range in the metadata', () => {
    const fallback = 'stored over the range of its overview ± 100%';
    expect(formatRangeWarning([], 4)).toBe(null);
    expect(formatRangeWarning([0, 1, 2, 3], 4))
      .toBe(`No value range in the metadata for any channel: ${fallback}`);
    expect(formatRangeWarning([0], 1))
      .toBe(`No value range in the metadata for the channel: ${fallback}`);
    expect(formatRangeWarning([2, 5], 70))
      .toBe(`No value range in the metadata for channel 2, 5: ${fallback}`);
  });

  it('hints at chunks outside the recommended sizes', () => {
    const levelOf = (shape, chunks, dtype = 'uint16') => getVolumeInfo({
      sourceArrays: [{ shape, chunks, dtype }],
      labels: ['z', 'y', 'x'],
      levels: [{ source: 0, dataShape: shape, zFactor: 1, zMode: 'sample' }],
      firstSource: 0,
      spacing: [1, 1, 1],
    }).sourceLevels[0];
    // idr0066: one-plane chunks of the whole 2048 x 2048 plane.
    const planes = levelOf([1937, 2048, 2048], [1, 2048, 2048]);
    expect(planes.brickReadFactor).toBe(4096);
    expect(formatChunkWarning(planes)).toBe('Slow loading: each brick downloads and decodes'
      + ' 4096× the data it needs (chunks 2048 × 2048 × 1);'
      + ' chunks with Z ≥ 32 and X, Y, Z ≤ 256 load faster');
    // At the recommended limits, and with a stack shallower than a brick.
    expect(formatChunkWarning(levelOf([500, 2048, 2048], [32, 256, 256]))).toBe(null);
    expect(formatChunkWarning(levelOf([500, 2048, 2048], [256, 256, 256]))).toBe(null);
    expect(formatChunkWarning(levelOf([1, 2048, 2048], [1, 256, 256]))).toBe(null);
    // Too shallow, or too deep, though within XY.
    expect(formatChunkWarning(levelOf([500, 2048, 2048], [1, 256, 256]))).toMatch(/64×/);
    expect(formatChunkWarning(levelOf([2000, 2048, 2048], [512, 64, 64]))).toMatch(/64×/);
    // Small chunks read no more than the brick: no hint.
    expect(formatChunkWarning(levelOf([500, 2048, 2048], [16, 32, 32]))).toBe(null);
    // TIFF tiles of 512 x 512 read 32 planes: 256 times the brick.
    expect(levelOf([100, 2048, 2048], [1, 512, 512]).brickReadFactor).toBe(256);
  });
});

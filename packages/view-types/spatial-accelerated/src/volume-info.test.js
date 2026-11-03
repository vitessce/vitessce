import { describe, it, expect } from 'vitest';
import {
  getVolumeInfo, formatBytes, formatExtent, formatDtype,
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
});

import { describe, it, expect, vi } from 'vitest';
import {
  type Volume,
  getOutputDtype,
  toDisplaySlice,
  getDisplayGeometry,
  createSliceSource,
} from './volume.js';

describe('getOutputDtype', () => {
  it('keeps the raw dtype when there is no rescaling', () => {
    expect(getOutputDtype('Uint16', [0, 65535], 1, 0)).toEqual('Uint16');
    expect(getOutputDtype('Float64', [0, 1], 1, 0)).toEqual('Float32');
  });

  it('uses Int16 for integral values that fit, such as CT in HU', () => {
    expect(getOutputDtype('Uint16', [0, 4095], 1, -1024)).toEqual('Int16');
  });

  it('uses Float32 otherwise', () => {
    expect(getOutputDtype('Uint16', [0, 65535], 1, -1000)).toEqual('Float32');
    expect(getOutputDtype('Uint8', [0, 255], 0.5, 0)).toEqual('Float32');
  });
});

describe('toDisplaySlice', () => {
  const raw = new Int16Array([1, 2, 3, 4, 5, 6]);
  const params = {
    width: 3, height: 2, slope: 1, intercept: 0, dtype: 'Int16' as const,
  };

  it('returns the input when there is nothing to do', () => {
    expect(toDisplaySlice(raw, { ...params, isFlippedX: false, isFlippedY: false })).toBe(raw);
  });

  it('flips and rescales', () => {
    expect(Array.from(toDisplaySlice(raw, { ...params, isFlippedX: true, isFlippedY: false })))
      .toEqual([3, 2, 1, 6, 5, 4]);
    expect(Array.from(toDisplaySlice(raw, { ...params, isFlippedX: false, isFlippedY: true })))
      .toEqual([4, 5, 6, 1, 2, 3]);
    expect(Array.from(toDisplaySlice(raw, {
      ...params, slope: 2, intercept: -1, isFlippedX: false, isFlippedY: false,
    }))).toEqual([1, 3, 5, 7, 9, 11]);
  });
});

describe('getDisplayGeometry', () => {
  // Axial DICOM series: rows along +x (left), columns along +y (posterior),
  // slices along +z (superior), first voxel center at (-10, -20, 30).
  const axial = [
    [0.5, 0, 0, -10],
    [0, 0.5, 0, -20],
    [0, 0, 2, 30],
  ];
  const shape: [number, number, number] = [4, 3, 5];

  it('maps an axial series with z pointing inferior', () => {
    const geometry = getDisplayGeometry(axial, shape);
    expect(geometry.scale).toEqual([0.5, 0.5, 2]);
    expect(geometry.flips).toEqual([false, false, true]);
    // The last slice (z = 30 + 2 * 4 = 38) is the most inferior, so it comes first.
    expect(geometry.translation).toEqual([-10.25, -20.25, -38 - 1]);
    expect(geometry.isOblique).toBe(false);
  });

  it('gives the same geometry for the same grid stored in reverse order', () => {
    const reversedX = axial.map(row => [-row[0], row[1], row[2], row[3] + row[0] * (shape[0] - 1)]);
    const geometry = getDisplayGeometry(reversedX, shape);
    expect(geometry.flips).toEqual([true, false, true]);
    expect(geometry.scale).toEqual(getDisplayGeometry(axial, shape).scale);
    expect(geometry.translation).toEqual(getDisplayGeometry(axial, shape).translation);
  });

  it('puts superior at the top of sagittal slices', () => {
    // Rows along +y (posterior), columns along -z (inferior).
    const sagittal = [
      [0, 0, 1, 0],
      [1, 0, 0, 0],
      [0, -1, 0, 0],
    ];
    expect(getDisplayGeometry(sagittal, shape).flips).toEqual([false, false, false]);
  });

  it('detects oblique acquisitions', () => {
    const angle = 0.1;
    const oblique = [
      [Math.cos(angle), -Math.sin(angle), 0, 0],
      [Math.sin(angle), Math.cos(angle), 0, 0],
      [0, 0, 1, 0],
    ];
    expect(getDisplayGeometry(oblique, shape).isOblique).toBe(true);
  });

  it('rejects degenerate axes', () => {
    const degenerate = [
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 1, 0],
    ];
    expect(() => getDisplayGeometry(degenerate, shape)).toThrow('not linearly independent');
  });
});

describe('createSliceSource', () => {
  it('loads each slice once, in display order', async () => {
    const loadRawSlice = vi.fn(async (z: number) => new Int16Array([z, z]));
    const volume = {
      width: 2, height: 1, depth: 3, numT: 1, slope: 1, intercept: 0, loadRawSlice,
    } as unknown as Volume;
    const geometry = {
      scale: [1, 1, 1], translation: [0, 0, 0], flips: [false, false, true], isOblique: false,
    };
    const source = createSliceSource(volume, geometry, 'Int16');
    expect(source.shape).toEqual([1, 1, 3, 1, 2]);

    const raster = await source.getRaster({ selection: { z: 0 } });
    expect(Array.from(raster.data)).toEqual([2, 2]);
    raster.data.fill(0);
    const again = await source.getRaster({ selection: { z: 0 } });
    expect(loadRawSlice).toHaveBeenCalledTimes(1);
    // Changes made by callers do not leak into the cache.
    expect(Array.from(again.data)).toEqual([2, 2]);
  });
});

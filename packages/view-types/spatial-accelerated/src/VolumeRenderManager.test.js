import { describe, it, expect } from 'vitest';
import { getScreenLodFactor, getClippingBounds, sliceToClip } from './VolumeRenderManager.js';

describe('clipping', () => {
  // Column-major 4x4 scaling by physical voxel sizes 0.2, 0.2, 0.5.
  const modelMatrix = [0.2, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 1];

  it('gets the slider range in physical units, accepting uppercase axis names', () => {
    const expected = [[0, 200], [0, 100], [0, 25]];
    expect(getClippingBounds([1, 50, 500, 1000], ['c', 'z', 'y', 'x'], modelMatrix))
      .toEqual(expected);
    expect(getClippingBounds([1, 50, 500, 1000], ['C', 'Z', 'Y', 'X'], modelMatrix))
      .toEqual(expected);
  });

  it('maps a slider range to box coordinates by its fraction of the slider range', () => {
    // Half of a 200 um wide slider is half of the box, whatever the voxel count.
    expect(sliceToClip([50, 100], [0, 200], 1)).toEqual([0.25, 0.5]);
    expect(sliceToClip([0, 25], [0, 25], 0.05)).toEqual([0, 0.05]);
  });

  it('is inactive without a slice or with invalid bounds', () => {
    expect(sliceToClip(null, [0, 200], 1)).toEqual([-1, 100000]);
    expect(sliceToClip([0, 1], [0, NaN], 1)).toEqual([-1, 100000]);
  });
});

describe('getScreenLodFactor', () => {
  // The shader's target level: floor(log2(distance * factor * voxelEdge / 256)).
  const shaderVoxelsPerPixel = (factor, distance, shape) => distance * factor
    * Math.max(shape[2], shape[3], shape[4]) / 256;

  it('makes a factor of 1 target one level-0 voxel per pixel', () => {
    // idr0048A, in a 900 pixel tall view at the default 50 degree field of view.
    const shape = [1, 3, 1402, 5192, 2947];
    const distance = 4;
    const factor = getScreenLodFactor(1, 50, 900, shape);
    // The box is one unit wide in x, so a pixel at this distance spans:
    const voxelsPerPixel = distance * 2 * Math.tan((25 * Math.PI) / 180) * 2947 / 900;
    expect(shaderVoxelsPerPixel(factor, distance, shape)).toBeCloseTo(voxelsPerPixel);
    expect(Math.floor(Math.log2(voxelsPerPixel))).toEqual(3);
  });

  it('scales with the spatialLodFactor and the view height', () => {
    const shape = [1, 1, 256, 256, 256];
    const factor = getScreenLodFactor(1, 50, 900, shape);
    expect(getScreenLodFactor(0.5, 50, 900, shape)).toBeCloseTo(factor / 2);
    expect(getScreenLodFactor(1, 50, 1800, shape)).toBeCloseTo(factor / 2);
  });
});

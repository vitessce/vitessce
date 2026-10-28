import { describe, it, expect } from 'vitest';
import { getScreenLodFactor } from './VolumeRenderManager.js';

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

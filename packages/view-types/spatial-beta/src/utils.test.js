import { describe, it, expect } from 'vitest';
import { Matrix4 } from 'math.gl';
import { viv } from '@vitessce/gl';
import { getPhysicalSizeScalingMatrix } from '@vitessce/spatial-utils';
import { getVolumeModelMatrix, isLayerVisible, getLayerLoaderTuple } from './utils.js';

/**
 * Stand-in for a viv PixelSource. Only `meta.physicalSizes` is read.
 */
function fakeSource(x, y, z, unit = 'µm') {
  return {
    meta: {
      physicalSizes: {
        x: { size: x, unit },
        y: { size: y, unit },
        z: { size: z, unit },
      },
    },
  };
}

/**
 * Reproduce what viv's XR3DLayer vertex shader does with the matrices it is
 * given: `model * scale`, where `scale` is derived internally by VolumeLayer from
 * the same physicalSizes metadata. Returns the rendered extent of the volume.
 */
function renderedExtent(source, modelMatrix, shape) {
  const vivScale = getPhysicalSizeScalingMatrix(source);
  return new Matrix4(modelMatrix)
    .multiplyRight(vivScale)
    .transformPoint(shape);
}

describe('view-types/spatial-beta/utils', () => {
  describe('getVolumeModelMatrix', () => {
    // HuBMAP 3DIMC dataset HBM459.CGSD.533: 452x514x50 voxels at 1x1x2 um.
    const anisotropicZ = fakeSource(1, 1, 2);
    const shape = [452, 514, 50];
    // ImageWrapper.getModelMatrix() scales into absolute micrometers.
    const physicalModelMatrix = new Matrix4().scale([1, 1, 2]);

    it('renders the true physical extent instead of squaring the anisotropy', () => {
      const volumeModelMatrix = getVolumeModelMatrix(
        anisotropicZ, physicalModelMatrix,
      );
      expect(
        renderedExtent(anisotropicZ, volumeModelMatrix, shape),
      ).toEqual([452, 514, 100]);
    });

    it('regression: passing the physical model matrix straight through doubles z', () => {
      // This is what the beta spatial view did before the fix.
      expect(
        renderedExtent(anisotropicZ, physicalModelMatrix, shape),
      ).toEqual([452, 514, 200]);
    });

    it('is not z-specific', () => {
      // Same dataset, anisotropic in x instead.
      const anisotropicX = fakeSource(2, 1, 1);
      const modelMatrix = new Matrix4().scale([2, 1, 1]);
      const volumeModelMatrix = getVolumeModelMatrix(anisotropicX, modelMatrix);
      expect(
        renderedExtent(anisotropicX, volumeModelMatrix, shape),
      ).toEqual([904, 514, 50]);
    });

    it('is a no-op for isotropic voxels', () => {
      const isotropic = fakeSource(0.5, 0.5, 0.5);
      const modelMatrix = new Matrix4().scale([0.5, 0.5, 0.5]);
      // viv normalizes by the minimum, so its matrix is already the identity.
      expect(
        getVolumeModelMatrix(isotropic, modelMatrix),
      ).toEqual(modelMatrix);
    });

    it('accepts a PixelSource array and uses the full-resolution level', () => {
      const volumeModelMatrix = getVolumeModelMatrix(
        [anisotropicZ, anisotropicZ], physicalModelMatrix,
      );
      expect(
        renderedExtent(anisotropicZ, volumeModelMatrix, shape),
      ).toEqual([452, 514, 100]);
    });

    it('falls back to the identity when there is no model matrix', () => {
      // Missing physicalSizes: viv's matrix is the identity, so is ours.
      const noPhysicalSizes = { meta: {} };
      expect(
        getVolumeModelMatrix(noPhysicalSizes, undefined),
      ).toEqual(new Matrix4().identity());
    });
  });

  describe('isLayerVisible', () => {
    it('is visible when explicitly true', () => {
      expect(isLayerVisible(true)).toBe(true);
    });

    it('is hidden when explicitly false', () => {
      expect(isLayerVisible(false)).toBe(false);
    });

    it('is visible when unset, matching the layer controller default', () => {
      // ImageLayerController treats a non-boolean spatialLayerVisible as visible, so a layer
      // whose config omits it must not be skipped in 3D.
      expect(isLayerVisible(undefined)).toBe(true);
      expect(isLayerVisible(null)).toBe(true);
    });
  });

  describe('getLayerLoaderTuple', () => {
    it('wraps a single non-array loader in a new array whose contents are stable across calls', () => {
      // Regression test: getLayerLoaderTuple used to build a brand-new
      // wrapper array on every call even when the underlying loader was
      // unchanged (Array.isArray(loader) ? loader : [loader]).
      // A fresh wrapper array every render made viv re-run its full
      // volume-processing pipeline on every camera-driven re-render, not
      // just on real data changes. Callers now cache and compare via
      // isEqual(), so the contents (not the reference) must be stable.
      const data = { foo: 'bar' };
      const [, loaderA] = getLayerLoaderTuple(data, true);
      const [, loaderB] = getLayerLoaderTuple(data, true);
      expect(loaderA).toEqual(loaderB);
      expect(loaderA).toEqual([data]);
    });

    it('returns VolumeLayer with the raw array unwrapped for 3D multi-source data', () => {
      const data = [{ a: 1 }, { b: 2 }];
      const [Layer, loader] = getLayerLoaderTuple(data, true);
      expect(Layer).toBe(viv.VolumeLayer);
      expect(loader).toBe(data);
    });

    it('returns MultiscaleImageLayer for non-3D multi-source data', () => {
      const data = [{ a: 1 }, { b: 2 }];
      const [Layer] = getLayerLoaderTuple(data, false);
      expect(Layer).toBe(viv.MultiscaleImageLayer);
    });

    it('returns ImageLayer for non-3D single-source data', () => {
      const data = [{ a: 1 }];
      const [Layer, loader] = getLayerLoaderTuple(data, false);
      expect(Layer).toBe(viv.ImageLayer);
      expect(loader).toBe(data[0]);
    });
  });
});

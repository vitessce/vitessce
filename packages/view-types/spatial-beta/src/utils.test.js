import { describe, it, expect } from 'vitest';
import { isLayerVisible } from './utils.js';

describe('spatial-beta/utils.js', () => {
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
});

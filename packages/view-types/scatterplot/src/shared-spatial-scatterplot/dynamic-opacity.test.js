import { describe, it, expect } from 'vitest';
import { getPointSizeDevicePixels, getPointOpacity } from './dynamic-opacity.js';

describe('dynamic-opacity.js', () => {
  describe('getPointSizeDevicePixels', () => {
    it('calculates point size', () => {
      const devicePixelRatio = 2.0;
      const zoom = null;
      const xRange = 20;
      const yRange = 18;
      const width = 1000;
      const height = 650;
      const pointSize = getPointSizeDevicePixels(
        devicePixelRatio, zoom, xRange, yRange, width, height,
      );
      expect(pointSize).toBeCloseTo(0.5);
    });
  });
  describe('getPointOpacity', () => {
    it('calculates point opacity', () => {
      const zoom = null;
      const width = 1000;
      const height = 650;
      const xRange = 20;
      const yRange = 18;
      const numCells = 500000;
      const avgFillDensity = undefined;
      const pointOpacity = getPointOpacity(
        zoom, xRange, yRange, width, height, numCells, avgFillDensity,
      );
      expect(pointOpacity).toBeCloseTo(0.005);
    });
  });
});

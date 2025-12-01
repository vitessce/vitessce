import { describe, it, expect } from 'vitest';
import { getPointSizeDevicePixels, getPointOpacity } from './dynamic-opacity.js';

describe('dynamic-opacity.js', () => {
  describe('getPointSizeDevicePixels', () => {
    it('calculates point size for high-count dataset (~500k cells)', () => {
      const devicePixelRatio = 2.0;
      const zoom = null;
      const xRange = 20;
      const yRange = 18;
      const width = 1000;
      const height = 650;
      const numCells = 500000;
      const pointSize = getPointSizeDevicePixels(
        devicePixelRatio, zoom, xRange, yRange, width, height, numCells,
      );
      // Should be around 0.0005 * diagonal for large datasets
      expect(pointSize).toBeCloseTo(0.5, 1);
    });

    it('calculates larger point size for low-count dataset (~5k cells)', () => {
      const devicePixelRatio = 2.0;
      const zoom = null;
      const xRange = 20;
      const yRange = 18;
      const width = 1000;
      const height = 650;
      const numCells = 5000;
      const pointSize = getPointSizeDevicePixels(
        devicePixelRatio, zoom, xRange, yRange, width, height, numCells,
      );
      // Should be around 0.01 * diagonal for small datasets
      expect(pointSize).toBeCloseTo(10, 0);
    });

    it('calculates intermediate point size for medium-count dataset (~50k cells)', () => {
      const devicePixelRatio = 2.0;
      const zoom = null;
      const xRange = 20;
      const yRange = 18;
      const width = 1000;
      const height = 650;
      const numCells = 50000;
      const pointSize = getPointSizeDevicePixels(
        devicePixelRatio, zoom, xRange, yRange, width, height, numCells,
      );
      // Should be between 0.0005 and 0.01, closer to middle on log scale
      expect(pointSize).toBeGreaterThan(0.5);
      expect(pointSize).toBeLessThan(10);
    });

    it('handles missing numCells by using default large dataset size', () => {
      const devicePixelRatio = 2.0;
      const zoom = null;
      const xRange = 20;
      const yRange = 18;
      const width = 1000;
      const height = 650;
      const numCells = undefined;
      const pointSize = getPointSizeDevicePixels(
        devicePixelRatio, zoom, xRange, yRange, width, height, numCells,
      );
      // Should default to 0.0005 * diagonal
      expect(pointSize).toBeCloseTo(0.5, 1);
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

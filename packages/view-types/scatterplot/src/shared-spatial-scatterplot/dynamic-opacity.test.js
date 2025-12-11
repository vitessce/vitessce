import { describe, it, expect } from 'vitest';
import { getPointSizeDevicePixels, getPointOpacity, getInitialPointSize,
  LARGE_DATASET_CELL_COUNT, SMALL_DATASET_CELL_COUNT,
  LARGE_DATASET_POINT_SIZE, SMALL_DATASET_POINT_SIZE } from './dynamic-opacity.js';

describe('dynamic-opacity.js', () => {
  describe('getInitialPointSize', () => {
    it('returns large point size for small datasets', () => {
      const numCells = SMALL_DATASET_CELL_COUNT;
      const pointSize = getInitialPointSize(numCells);
      expect(pointSize).toBe(SMALL_DATASET_POINT_SIZE);
    });

    it('returns small point size for large datasets', () => {
      const numCells = LARGE_DATASET_CELL_COUNT;
      const pointSize = getInitialPointSize(numCells);
      expect(pointSize).toBe(LARGE_DATASET_POINT_SIZE);
    });

    it('returns intermediate point size for medium datasets', () => {
      const numCells = (SMALL_DATASET_CELL_COUNT + LARGE_DATASET_CELL_COUNT) / 2;
      const pointSize = getInitialPointSize(numCells);
      expect(pointSize).toBeLessThan(SMALL_DATASET_POINT_SIZE);
      expect(pointSize).toBeGreaterThan(LARGE_DATASET_POINT_SIZE);
    });

    it('handles missing numCells by using default large dataset size', () => {
      const numCells = undefined;
      const pointSize = getInitialPointSize(numCells);
      expect(pointSize).toBe(LARGE_DATASET_POINT_SIZE);
    });
  });
  describe('getPointSizeDevicePixels', () => {
    it('calculates point size', () => {
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
      expect(pointSize).toBeCloseTo(0.5);
    });
  });
  describe('getPointOpacity', () => {
    it('calculates point opacity', () => {
      const zoom = null;
      const width = 1000;
      const height = 1000;
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

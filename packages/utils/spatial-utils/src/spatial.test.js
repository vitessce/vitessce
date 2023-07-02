import { describe, it, expect } from 'vitest';
import { square, coordinateTransformationsToMatrix } from './spatial.js';

const defaultAxes = [
  { type: 'time', name: 't' },
  { type: 'channel', name: 'c' },
  { type: 'space', name: 'z' },
  { type: 'space', name: 'y' },
  { type: 'space', name: 'x' },
];

describe('Spatial.js', () => {
  describe('square()', () => {
    it('gives the right coordinates', () => {
      expect(square(0, 0, 50)).toEqual([[0, 50], [50, 0], [0, -50], [-50, 0]]);
    });
  });
  describe('coordinateTransformationsToMatrix', () => {
    it('returns an Array instance', () => {
      const transformations = [
        {
          type: 'translation',
          translation: [0, 0, 0, 1, 1],
        },
        {
          type: 'scale',
          scale: [1, 1, 0.5, 0.5, 0.5],
        },
      ];
      expect(coordinateTransformationsToMatrix(transformations, defaultAxes)).toEqual([
        0.5, 0, 0, 0,
        0, 0.5, 0, 0,
        0, 0, 0.5, 0,
        0.5, 0.5, 0, 1,
      ]);
    });
    it('returns Identity matrix when coordinateTransformations is null', () => {
      expect(coordinateTransformationsToMatrix(null, defaultAxes)).toEqual([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ]);
    });
  });
});

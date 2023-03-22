import { square, coordinateTransformationsToMatrix } from './spatial';

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
          translation: [1, 1, 0],
        },
        {
          type: 'scale',
          scale: [0.5, 0.5, 0.5],
        },
      ];
      expect(coordinateTransformationsToMatrix(transformations)).toEqual([
        0.5, 0, 0, 0,
        0, 0.5, 0, 0,
        0, 0, 0.5, 0,
        0.5, 0.5, 0, 1,
      ]);
    });
  });
});

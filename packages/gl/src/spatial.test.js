import { square } from './spatial';

describe('Spatial.js', () => {
  describe('square()', () => {
    it('gives the right coordinates', () => {
      expect(square(0, 0, 50)).toEqual([[0, 50], [50, 0], [0, -50], [-50, 0]]);
    });
  });
});

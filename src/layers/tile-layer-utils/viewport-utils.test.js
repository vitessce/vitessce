import expect from 'expect';
import { getTileIndices } from './viewport-utils';

describe('tile-layer-utils/viewport-utils.js', () => {
  describe('getTileIndices()', () => {
    it('return a 2 x 2 tile with no projection', () => {
      var viewport = {
        zoom: -2,
        unproject: e => e,
        height: 8000,
        width: 8000,
      }
      expect(getTileIndices(viewport, 0, -16, 1000)).toEqual([
        {x: 0, z: -2, y: 0}, {x: 0, z: -2, y: 1},
        {x: 1, z: -2, y: 0}, {x: 1, z: -2, y: 1}
      ]);
    });
  });

  describe('getTileIndices()', () => {
    it('return a {x: 0, z: 0, y: 0} out of bounds', () => {
      var viewport = {
        zoom: -17,
        unproject: e => e,
        height: 8000,
        width: 8000,
      }
      expect(getTileIndices(viewport, 0, -16, 1000)).toEqual([{x: 0, z:-16, y: 0}]);
    });
  });
});

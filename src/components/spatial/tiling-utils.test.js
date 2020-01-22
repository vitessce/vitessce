import expect from 'expect';
import { getTileIndices } from './tiling-utils';

describe('./tiling-utils.js', () => {
  describe('getTileIndices()', () => {
    it('return a 2 x 2 tile with no projection', () => {
      const viewport = {
        zoom: -2,
        unproject: e => e,
        height: 8000,
        width: 8000,
      };
      expect(getTileIndices(viewport, 0, -16, 1000, 100000, 100000)).toEqual([
        { x: 0, y: 0, z: -2 }, { x: 0, y: 1, z: -2 },
        { x: 1, y: 0, z: -2 }, { x: 1, y: 1, z: -2 },
      ]);
    });

    it('return a 4 x 4 tile with double unprojection', () => {
      const viewport = {
        zoom: -2,
        unproject: e => [2 * e[0], 2 * e[1]],
        height: 8000,
        width: 8000,
      };
      expect(getTileIndices(viewport, 0, -16, 1000, 100000, 100000)).toEqual([
        { x: 0, y: 0, z: -2 }, { x: 0, y: 1, z: -2 }, { x: 0, y: 2, z: -2 },
        { x: 0, y: 3, z: -2 },
        { x: 1, y: 0, z: -2 }, { x: 1, y: 1, z: -2 }, { x: 1, y: 2, z: -2 },
        { x: 1, y: 3, z: -2 },
        { x: 2, y: 0, z: -2 }, { x: 2, y: 1, z: -2 }, { x: 2, y: 2, z: -2 },
        { x: 2, y: 3, z: -2 },
        { x: 3, y: 0, z: -2 }, { x: 3, y: 1, z: -2 }, { x: 3, y: 2, z: -2 },
        { x: 3, y: 3, z: -2 },
      ]);
    });

    it('return a 2 x 3 tile with uneven height/width', () => {
      const viewport = {
        zoom: -2,
        unproject: e => e,
        height: 12000,
        width: 8000,
      };
      expect(getTileIndices(viewport, 0, -16, 1000, 100000, 100000)).toEqual([
        { x: 0, y: 0, z: -2 }, { x: 0, y: 1, z: -2 }, { x: 0, y: 2, z: -2 },
        { x: 1, y: 0, z: -2 }, { x: 1, y: 1, z: -2 }, { x: 1, y: 2, z: -2 },
      ]);
    });

    it('return a {x: 0, z: 0, y: 0} out of bounds min', () => {
      const viewport = {
        zoom: -17,
        unproject: e => e,
        height: 8000,
        width: 8000,
      };
      expect(getTileIndices(viewport, 0, -16, 1000, 100000, 100000)).toEqual([{ x: 0, y: 0, z: -16 }]);
    });

    it('return a tile only up to the min/max', () => {
      const viewport = {
        zoom: 0,
        unproject: e => e,
        height: 8000,
        width: 8000,
      };
      expect(getTileIndices(viewport, 0, -16, 1000, 1000, 1000)).toEqual([{ x: 0, y: 0, z: 0 }]);
    });
  });
});

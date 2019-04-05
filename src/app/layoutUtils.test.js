import expect from 'expect';

import { makeGridLayout, range, getMaxRows } from './layoutUtils';

describe('layoutUtils.js', () => {
  describe('makeGridLayout', () => {
    it('applies columnXs and makes list from object', () => {
      const columnXs = [0, 4, 8, 12];
      const layout = {
        bigLeft: { x: 0, y: 0, w: 2 },
        smallRight: { x: 2, y: 0 },
        smallLeft: { x: 0, y: 1 },
        bigRight: { x: 1, y: 1, w: 2 },
        wholeRow: { x: 0, y: 2, w: 3 },
      };
      const gridLayout = makeGridLayout(columnXs, layout);
      expect(gridLayout).toEqual(
        /* Disable eslint so it's easier to copy-and-paste from test results. */
        /* eslint-disable quote-props */
        /* eslint-disable quotes */
        [
          {
            "h": 1,
            "i": "bigLeft",
            "w": 8,
            "x": 0,
            "y": 0,
          },
          {
            "h": 1,
            "i": "smallRight",
            "w": 4,
            "x": 8,
            "y": 0,
          },
          {
            "h": 1,
            "i": "smallLeft",
            "w": 4,
            "x": 0,
            "y": 1,
          },
          {
            "h": 1,
            "i": "bigRight",
            "w": 8,
            "x": 4,
            "y": 1,
          },
          {
            "h": 1,
            "i": "wholeRow",
            "w": 12,
            "x": 0,
            "y": 2,
          },
        ],
        /* eslint-enable */
      );
    });
  });

  describe('range', () => {
    it('works like python', () => {
      expect(range(4)).toEqual([0, 1, 2, 3]);
    });
  });

  describe('getMaxRows', () => {
    it('works', () => {
      const columnXs = [0, 4, 8, 12];
      const layout = {
        bigLeft: { x: 0, y: 0, w: 2 },
        smallRight: { x: 2, y: 0 },
        smallLeft: { x: 0, y: 1 },
        bigRight: { x: 1, y: 1, w: 2 },
        wholeRow: { x: 0, y: 2, w: 3 },
      };
      const gridLayout = makeGridLayout(columnXs, layout);
      expect(getMaxRows([gridLayout])).toEqual(3);
    });
  });
});

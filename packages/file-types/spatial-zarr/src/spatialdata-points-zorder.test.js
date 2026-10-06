/* eslint-disable camelcase */
/* eslint-disable no-bitwise */
import { describe, it, expect } from 'vitest';
import {
  origCoordToNormCoord,
  sdataMortonQueryRectAux,
} from './spatialdata-points-zorder.js';

// Interleave bits of normalized x and y (x in the even bits, y in the odd bits),
// matching the child-code convention used by zcoverRectangle (q1 = x>midx -> 0b01).
function encodeMorton(normX, normY) {
  let code = 0;
  for (let i = 0; i < 16; i++) {
    code += ((normX >> i) & 1) * (2 ** (2 * i));
    code += ((normY >> i) & 1) * (2 ** (2 * i + 1));
  }
  return code;
}

function isCovered(intervals, code) {
  return intervals.some(([lo, hi]) => lo <= code && code <= hi);
}

describe('spatialdata-points-zorder.js', () => {
  describe('sdataMortonQueryRectAux', () => {
    // The data extent is not a multiple of the tile size,
    // so the final row/column of tiles extends past the data bounding box
    // (i.e., the portion of those tiles containing data is shorter/thinner).
    const allPointsBbox = {
      x_min: 0,
      x_max: 1000,
      y_min: 0,
      y_max: 700,
    };
    const TILE_SIZE = 512;

    // Tile bounding boxes as deck.gl's TileLayer would request them
    // to cover the full data extent.
    const tileBboxes = [];
    for (let left = 0; left < allPointsBbox.x_max; left += TILE_SIZE) {
      for (let top = 0; top < allPointsBbox.y_max; top += TILE_SIZE) {
        tileBboxes.push({
          left, top, right: left + TILE_SIZE, bottom: top + TILE_SIZE,
        });
      }
    }

    // Points near each corner and edge of the data extent.
    const points = [
      [10, 10],
      [500, 10],
      [990, 10],
      [10, 690],
      [500, 690],
      [990, 690],
      [990, 300],
      [300, 600],
      [1000, 700],
    ];

    it('covers points within an interior tile', () => {
      const tileBbox = tileBboxes.find(t => t.left === 0 && t.top === 0);
      const intervals = sdataMortonQueryRectAux(allPointsBbox, [
        [tileBbox.left, tileBbox.top],
        [tileBbox.right, tileBbox.bottom],
      ]);
      const code = encodeMorton(...origCoordToNormCoord([10, 10], 0, 1000, 0, 700));
      expect(isCovered(intervals, code)).toBe(true);
    });

    it('returns no intervals for a rectangle entirely outside the data extent', () => {
      const intervals = sdataMortonQueryRectAux(allPointsBbox, [
        [1024, 0],
        [1280, 256],
      ]);
      expect(intervals).toEqual([]);
    });

    it('covers points when the rectangle extends below the data extent minimum', () => {
      const intervals = sdataMortonQueryRectAux(allPointsBbox, [
        [-512, -512],
        [512, 512],
      ]);
      const code = encodeMorton(...origCoordToNormCoord([0, 0], 0, 1000, 0, 700));
      expect(isCovered(intervals, code)).toBe(true);
    });

    it.each(tileBboxes.map(t => [`${t.left},${t.top},${t.right},${t.bottom}`, t]))(
      'does not throw for tile %s, including tiles extending past the data extent',
      (_, tileBbox) => {
        expect(() => sdataMortonQueryRectAux(allPointsBbox, [
          [tileBbox.left, tileBbox.top],
          [tileBbox.right, tileBbox.bottom],
        ])).not.toThrow();
      },
    );

    it.each(points)(
      'covers point (%d, %d) using the tile that contains it',
      (x, y) => {
        const tileBbox = tileBboxes.find(t => (
          t.left <= x && x <= t.right && t.top <= y && y <= t.bottom
        ));
        const intervals = sdataMortonQueryRectAux(allPointsBbox, [
          [tileBbox.left, tileBbox.top],
          [tileBbox.right, tileBbox.bottom],
        ]);
        const { x_min, x_max, y_min, y_max } = allPointsBbox;
        const code = encodeMorton(...origCoordToNormCoord([x, y], x_min, x_max, y_min, y_max));
        expect(isCovered(intervals, code)).toBe(true);
      },
    );
  });
});

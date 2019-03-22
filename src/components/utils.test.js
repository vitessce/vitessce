import expect from 'expect';
import { rgb, interpolateColors } from './utils';

describe('components/utils.js', () => {
  describe('rgb()', () => {
    it('maps hex values to arrays', () => {
      expect(rgb('#FF0000')).toEqual([255, 0, 0]);
    });
  });

  describe('interpolateColors()', () => {
    it('maps 0 to dark cool color', () => {
      expect(interpolateColors(0)).toEqual([13, 8, 135]);
    });

    it('maps 0.5 to medium color', () => {
      expect(interpolateColors(0.5)).toEqual([204, 71, 120]);
    });

    it('maps 1 to bright warm color', () => {
      expect(interpolateColors(1)).toEqual([240, 249, 33]);
    });
  });
});

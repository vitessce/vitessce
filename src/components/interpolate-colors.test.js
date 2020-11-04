import expect from 'expect';
import { interpolateRdBu, interpolatePlasma } from './interpolate-colors';

const expectRgb = ([testR, testG, testB], [r, g, b]) => ([
  expect(testR).toBeCloseTo(r),
  expect(testG).toBeCloseTo(g),
  expect(testB).toBeCloseTo(b),
]);

describe('components/interpolate-colors', () => {
  describe('interpolateRdBu()', () => {
    it('maps 0 to a red color', () => {
      expectRgb(interpolateRdBu(0), [103, 0, 31]);
    });

    it('maps 1 to a blue color', () => {
      expectRgb(interpolateRdBu(1), [5, 48, 97]);
    });
  });

  describe('interpolatePlasma()', () => {
    it('maps 0 to dark cool color', () => {
      expectRgb(interpolatePlasma(0), [13, 8, 135]);
    });

    it('maps 1 to bright warm color', () => {
      expectRgb(interpolatePlasma(1), [240, 249, 33]);
    });
  });
});

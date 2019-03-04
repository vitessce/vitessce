// eslint-disable-next-line import/no-extraneous-dependencies
import expect from 'expect';
import { square } from './Spatial';

describe('square()', () => {
  it('gives the right coordinates', () => {
    expect(square(0, 0)).toEqual([[0, 5], [5, 0], [0, -5], [-5, 0]]);
  });
});

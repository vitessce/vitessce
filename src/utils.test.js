import expect from 'expect';

import { range } from './utils';

describe('src/utils.js', () => {
  describe('range', () => {
    it('works like python', () => {
      expect(range(4)).toEqual([0, 1, 2, 3]);
    });
  });
});

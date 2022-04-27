import expect from 'expect';

import { getNextScope } from './utils';

describe('src/view-configs/utils.js', () => {
  describe('getNextScope', () => {
    it('generates a new scope name without conflicts', () => {
      expect(getNextScope([])).toEqual('A');
      expect(getNextScope(['A'])).toEqual('B');
      expect(getNextScope(['B'])).toEqual('A');
      expect(getNextScope(['A', 'B', 'C', 'D'])).toEqual('E');
      expect(getNextScope(['a'])).toEqual('A');
      expect(getNextScope(Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ'))).toEqual('AA');
      expect(getNextScope([...Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'AA'])).toEqual('AB');
      expect(getNextScope([...Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'AA', 'AB'])).toEqual('AC');
    });
  });
});

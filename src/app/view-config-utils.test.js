import expect from 'expect';

import { getNextScope, getExistingScopesForCoordinationType } from './view-config-utils';

describe('src/app/view-config-utils.js', () => {
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

  describe('getExistingScopesForCoordinationType', () => {
    it('gets all scope names for a particular coordination type', () => {
      const config = {
        coordinationSpace: {
          dataset: {
            A: 'my-dataset-1',
            B: 'my-dataset-2',
          },
        },
        layout: [
          {
            coordinationScopes: {
              dataset: 'A',
            },
          },
          {
            coordinationScopes: {
              dataset: 'C',
            },
          },
        ],
      };
      expect(getExistingScopesForCoordinationType(config, 'dataset')).toEqual(['A', 'B', 'C']);
    });
  });
});

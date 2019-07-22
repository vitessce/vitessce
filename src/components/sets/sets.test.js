import expect from 'expect';
import { HSetsNode } from './sets';

describe('sets.js', () => {
  describe('HSetsNode', () => {
    it('can be instantiated', () => {
      const node = new HSetsNode({
        setKey: 'test',
        name: 'Test Set',
        color: '#000',
        set: [],
      });
      expect(node.setKey).toEqual('test');
    });
  });
});

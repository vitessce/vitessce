import expect from 'expect';
import { SetsTreeNode } from './sets';

describe('sets.js', () => {
  describe('SetsTreeNode', () => {
    it('can be instantiated with properties', () => {
      const node = new SetsTreeNode({
        setKey: 'test',
        name: 'Test Set',
        color: '#000',
        set: [],
      });
      expect(node.setKey).toEqual('test');
      expect(node.name).toEqual('Test Set');
      expect(node.color).toEqual('#000');
      expect(node.set.length).toEqual(0);
      expect(node.children).toEqual(undefined);
      expect(node.isCurrentSet).toEqual(false);
      expect(node.wasPreviousCurrentSet).toEqual(false);
      expect(node.isEditing).toEqual(false);
    });
  });
});

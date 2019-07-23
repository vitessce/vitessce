import expect from 'expect';
import SetsTree, { SetsTreeNode } from './sets';

const node = new SetsTreeNode({
  setKey: 'test',
  name: 'Test Set',
  color: '#000',
  set: [],
});
const nodeWithChildren = new SetsTreeNode({
  setKey: 'test',
  name: 'Test Set',
  children: [
    new SetsTreeNode({
      setKey: 'test-child',
      name: 'Child of Test Set',
    }),
  ],
});
const nodeWithGrandchildren = new SetsTreeNode({
  setKey: 'test',
  name: 'Test Set',
  children: [
    new SetsTreeNode({
      setKey: 'test-child',
      name: 'Child of Test Set',
      children: [
        new SetsTreeNode({
          setKey: 'test-grandchild-1',
          name: 'Grandchild of Test Set',
          isCurrentSet: true,
        }),
        new SetsTreeNode({
          setKey: 'test-grandchild-2',
          name: 'Grandchild of Test Set',
        }),
      ],
    }),
  ],
});

describe('sets.js', () => {
  describe('SetsTreeNode', () => {
    it('can be instantiated with properties', () => {
      expect(node.setKey).toEqual('test');
      expect(node.name).toEqual('Test Set');
      expect(node.color).toEqual('#000');
      expect(node.set.length).toEqual(0);
      expect(node.children).toEqual(undefined);
      expect(node.isCurrentSet).toEqual(false);
      expect(node.wasPreviousCurrentSet).toEqual(false);
      expect(node.isEditing).toEqual(false);
    });

    it('can find nodes', () => {
      expect(node.findNode('test').setKey).toEqual('test');
      expect(nodeWithChildren.findNode('test-child').setKey)
        .toEqual('test-child');
      expect(nodeWithGrandchildren.findNode('test-grandchild-1').setKey)
        .toEqual('test-grandchild-1');
      expect(nodeWithGrandchildren.findNode('test-grandchild-2').setKey)
        .toEqual('test-grandchild-2');
    });

    it('can find parents of nodes', () => {
      expect(node.findParentNode('test')).toEqual(null);
      expect(nodeWithChildren.findParentNode('test-child').setKey)
        .toEqual('test');
      expect(nodeWithGrandchildren.findParentNode('test-grandchild-2').setKey)
        .toEqual('test-child');
    });

    it('can find the current set node', () => {
      expect(nodeWithGrandchildren.findCurrentSetNode().setKey)
        .toEqual('test-grandchild-1');
    });

    it('has a path-like key value', () => {
      expect(node.getKeyTail()).toEqual('test');

      const node2 = new SetsTreeNode({
        setKey: 'all.test',
        name: 'Test Set under All',
      });
      expect(node2.getKeyTail()).toEqual('test');
      expect(node2.getKeyHead()).toEqual('all');

      const node3 = new SetsTreeNode({
        setKey: 'all.test.more',
        name: 'Test Set under All',
      });
      expect(node3.getKeyTail()).toEqual('more');
      expect(node3.getKeyHead()).toEqual('all.test');
    });

    it('can determine its own level', () => {
      expect(node.getLevel()).toEqual(0);
      expect(nodeWithChildren.getLevel()).toEqual(1);
      expect(nodeWithGrandchildren.getLevel()).toEqual(2);
    });

    it('can get all descendents at a particular level as a flat array', () => {
      expect(node.getDescendantsFlat(0).length).toEqual(0);
      expect(nodeWithChildren.getDescendantsFlat(0).length).toEqual(1);
      expect(nodeWithChildren.getDescendantsFlat(1).length).toEqual(0);
      expect(nodeWithGrandchildren.getDescendantsFlat(0).length).toEqual(1);
      expect(nodeWithGrandchildren.getDescendantsFlat(1).length).toEqual(2);
      expect(nodeWithGrandchildren.getDescendantsFlat(2).length).toEqual(0);
    });
  });

  describe('SetsTree', () => {
    it('has a root node upon instantiation', () => {
      const tree = new SetsTree();
      expect(tree.root).toBeTruthy();
    });

    it('can set checked keys', () => {
      const tree = new SetsTree();
      expect(tree.checkedKeys.length).toEqual(0);
      tree.setCheckedKeys(['test']);
      expect(tree.checkedKeys[0]).toEqual('test');
    });

    it('can set the current set', () => {
      const tree = new SetsTree();
      expect(tree.findCurrentSetNode()).toEqual(null);
      tree.setCurrentSet([1, 2, 3]);
      expect(tree.findCurrentSetNode().set).toEqual([1, 2, 3]);
      expect(tree.visibleKeys.length).toEqual(0);
      tree.setCurrentSet([2, 3, 4], true);
      expect(tree.findCurrentSetNode().set).toEqual([2, 3, 4]);
      expect(tree.visibleKeys.length).toEqual(1);
    });

    it('can start editing a node', () => {
      const tree = new SetsTree();
      tree.prependChild(new SetsTreeNode({
        setKey: 'test',
        name: 'Test',
        isEditing: false,
      }));
      expect(tree.findNode('all.test').isEditing).toBeFalsy();
      tree.startEditing('all.test');
      expect(tree.findNode('all.test').isEditing).toBeTruthy();
    });

    it('can delete a node', () => {
      const tree = new SetsTree();
      tree.prependChild(new SetsTreeNode({
        setKey: 'test',
        name: 'Test',
        isEditing: false,
      }));
      expect(tree.findNode('all.test').setKey).toEqual('all.test');
      tree.deleteNode('all.test');
      expect(tree.findNode('all.test')).toEqual(null);
    });

    it('can change a node name', () => {
      const tree = new SetsTree();
      tree.prependChild(new SetsTreeNode({
        setKey: 'test',
        name: 'Test',
        isEditing: true,
        isCurrentSet: false,
        wasPreviousCurrentSet: true,
      }));
      expect(tree.findNode('all.test').name).toEqual('Test');
      tree.changeNodeName('all.test', 'Harvard', false);
      expect(tree.findNode('all.test').name).toEqual('Harvard');
      expect(tree.findNode('all.test').isEditing).toEqual(true);
      expect(tree.findNode('all.test').isCurrentSet).toEqual(false);
      expect(tree.findNode('all.test').wasPreviousCurrentSet).toEqual(true);

      tree.prependChild(new SetsTreeNode({
        setKey: 'current-set',
        name: 'Current selection',
        isEditing: true,
        wasPreviousCurrentSet: true,
        isCurrentSet: true,
      }));
      tree.changeNodeName('all.current-set', 'MIT', true);
      expect(tree.findNode('all.current-set').name).toEqual('MIT');
      expect(tree.findNode('all.current-set').isEditing).toEqual(false);
      expect(tree.findNode('all.current-set').isCurrentSet).toEqual(false);
      expect(tree.findNode('all.current-set').wasPreviousCurrentSet).toEqual(false);
    });

    it('can prepend a node to children of root', () => {
      const tree = new SetsTree();
      tree.prependChild(new SetsTreeNode({
        setKey: 'test',
        name: 'Test',
      }));
      tree.prependChild(new SetsTreeNode({
        setKey: 'test-2',
        name: 'Test 2',
      }));
      expect(tree.root.children[1].setKey).toEqual('all.test');
      expect(tree.root.children[0].setKey).toEqual('all.test-2');
    });

    it('can append a node to children of root', () => {
      const tree = new SetsTree();
      tree.appendChild(new SetsTreeNode({
        setKey: 'test',
        name: 'Test',
      }));
      tree.appendChild(new SetsTreeNode({
        setKey: 'test-2',
        name: 'Test 2',
      }));
      expect(tree.root.children[0].setKey).toEqual('all.test');
      expect(tree.root.children[1].setKey).toEqual('all.test-2');
    });

    it('can view a set', () => {
      const tree = new SetsTree();
      tree.appendChild(new SetsTreeNode({
        setKey: 'test',
        name: 'Test',
      }));
      expect(tree.visibleKeys.length).toEqual(0);
      tree.viewSet('all.test');
      expect(tree.visibleKeys.length).toEqual(1);
      expect(tree.visibleKeys[0]).toEqual('all.test');
    });

    it('can view descendants of a set', () => {
      const tree = new SetsTree();
      tree.appendChild(new SetsTreeNode({
        setKey: 'test',
        name: 'Test',
        children: [
          new SetsTreeNode({
            setKey: 'test-child',
            name: 'Test child',
          }),
        ],
      }));
      expect(tree.visibleKeys.length).toEqual(0);
      tree.viewSetDescendants('all', 0);
      expect(tree.visibleKeys.length).toEqual(1);
      expect(tree.visibleKeys[0]).toEqual('all.test');
      tree.viewSetDescendants('all', 1);
      expect(tree.visibleKeys.length).toEqual(1);
      expect(tree.visibleKeys[0]).toEqual('all.test.test-child');
    });

    it('emits tree update event', (done) => {
      const tree = new SetsTree(() => { done(); });
      tree.appendChild(new SetsTreeNode({
        setKey: 'test',
        name: 'Test',
      }));
    });

    it('emits visibility update event', (done) => {
      const tree = new SetsTree(() => {}, (cellIds) => {
        expect(cellIds.size).toEqual(3);
        done();
      });
      tree.appendChild(new SetsTreeNode({
        setKey: 'test',
        name: 'Test',
        set: [1, 2, 3],
      }));
      tree.viewSet('all.test');
    });
  });
});

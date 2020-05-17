/* eslint-disable */
import expect from 'expect';
import reducer, {
  treeInitialize, treeExport, treeToVisibleCells, nodeToRenderProps, ACTION,
} from './reducer';

import {
  levelTwoNodeLeafWithoutState,
  levelTwoNodeLeaf,
  levelOneNodeWithoutState,
  levelOneNode,
  levelZeroNodeWithoutState,
  levelZeroNode,
  treeWithoutState,
  treeWithoutStateOrColors,
  treeIgnoreKeys,
  tree,
  emptyTreeWithoutState,
  emptyTreeIgnoreKeys,
  emptyTree,
} from './reducer.test.fixtures';


describe('Hierarchical sets reducer', () => {

  describe('Node rendering', () => {
    it('can get render properties for a node', () => {
      const levelTwoRenderProps = nodeToRenderProps(levelTwoNodeLeaf);

      expect(levelTwoRenderProps.title).toEqual('Pericytes');
      expect(levelTwoRenderProps.nodeKey).toEqual('pericytes');
      expect(levelTwoRenderProps.size).toEqual(3);
      expect(levelTwoRenderProps.color).toEqual([255, 0, 0]);
      expect(levelTwoRenderProps.level).toEqual(2);
      expect(levelTwoRenderProps.isEditing).toEqual(false);
      expect(levelTwoRenderProps.isCurrentSet).toEqual(false);
      expect(levelTwoRenderProps.isForTools).toEqual(false);
      expect(levelTwoRenderProps.isLeaf).toEqual(true);
      expect(levelTwoRenderProps.height).toEqual(0);

      const levelZeroRenderProps = nodeToRenderProps(levelZeroNode);

      expect(levelZeroRenderProps.title).toEqual('Cell Type Annotations');
      expect(levelZeroRenderProps.nodeKey).toEqual('cell-type-annotations');
      expect(levelZeroRenderProps.size).toEqual(6);
      expect(levelZeroRenderProps.color).toEqual(undefined);
      expect(levelZeroRenderProps.level).toEqual(0);
      expect(levelZeroRenderProps.isEditing).toEqual(false);
      expect(levelZeroRenderProps.isCurrentSet).toEqual(false);
      expect(levelZeroRenderProps.isForTools).toEqual(false);
      expect(levelZeroRenderProps.isLeaf).toEqual(false);
      expect(levelZeroRenderProps.height).toEqual(2);
    });
  })

  describe('Tree manipulation', () => {

    it('can be initialized', () => {
      const initialTree = treeInitialize('cell');

      expect(initialTree.datatype).toEqual('cell');
      expect(initialTree.version).toEqual('0.1.2');
      expect(initialTree.tree.length).toEqual(0);
      expect(initialTree._state.items.length).toEqual(0);
      expect(initialTree._state.checkedKeys.length).toEqual(0);
      expect(initialTree._state.visibleKeys.length).toEqual(0);
      expect(initialTree._state.checkedLevel.levelZeroKey).toEqual(null);
      expect(initialTree._state.checkedLevel.levelIndex).toEqual(null);
      expect(initialTree._state.expandedKeys.length).toEqual(0);
      expect(initialTree._state.autoExpandParent).toEqual(true);
      expect(initialTree._state.isChecking).toEqual(false);
    });

    it('should return the initial state', () => {
      const initialTree = treeInitialize('cell');
      expect(reducer(initialTree, {})).toEqual(initialTree);
    });

    it('can import a tree with colors', () => {
      const initialTree = emptyTree;

      expect(reducer(initialTree, {
        type: ACTION.IMPORT,
        levelZeroNodes: treeWithoutState.tree
      })).toMatchObject(treeIgnoreKeys);
    });

    it('can import a tree without colors', () => {
      const initialTree = emptyTree;

      const postImportTree = reducer(initialTree, {
        type: ACTION.IMPORT,
        levelZeroNodes: treeWithoutStateOrColors.tree
      });

      expect(postImportTree.tree[0].color).toEqual(undefined);
      expect(postImportTree.tree[0].children[0].color).toEqual([166, 206, 227]);
    });

    it('can import a tree and generate unique keys', () => {
      const initialTree = emptyTree;

      const postImportTree = reducer(initialTree, {
        type: ACTION.IMPORT,
        levelZeroNodes: treeWithoutState.tree
      });

      const keySet = new Set();
      keySet.add(postImportTree._state.key);
      keySet.add(postImportTree.tree[0]._state.key);
      keySet.add(postImportTree.tree[0].children[0]._state.key);
      keySet.add(postImportTree.tree[0].children[0].children[0]._state.key);
      keySet.add(postImportTree.tree[0].children[0].children[1]._state.key);

      expect(keySet.size).toEqual(5);
    });

    it('can check leaf nodes', () => {
      const initialTree = tree;
      expect(initialTree._state.checkedKeys).toEqual([]);

      const postCheckTree = reducer(initialTree, {
        type: ACTION.CHECK_NODE,
        targetKey: 'vasculature-endothelial',
        checked: true,
      });
      expect(postCheckTree._state.checkedKeys).toEqual(['vasculature-endothelial']);

      const postSecondCheckTree = reducer(postCheckTree, {
        type: ACTION.CHECK_NODE,
        targetKey: 'vasculature-pericytes',
        checked: true,
      });
      expect(postSecondCheckTree._state.checkedKeys).toEqual([
        'vasculature-endothelial',
        'vasculature-pericytes'
      ]);
    });

    it('can check non-leaf nodes', () => {
      const initialTree = tree;
      expect(initialTree._state.checkedKeys).toEqual([]);

      const postCheckTree = reducer(initialTree, {
        type: ACTION.CHECK_NODE,
        targetKey: 'vasculature',
        checked: true,
      });
      expect(postCheckTree._state.checkedKeys).toEqual([
        'vasculature',
        'vasculature-pericytes',
        'vasculature-endothelial',
      ]);
    });

    it('can un-check leaf nodes', () => {
      const initialTree = tree;
      expect(initialTree._state.checkedKeys).toEqual([]);

      const postCheckTree = reducer(initialTree, {
        type: ACTION.CHECK_NODE,
        targetKey: 'vasculature',
        checked: true,
      });
      expect(postCheckTree._state.checkedKeys).toEqual([
        'vasculature',
        'vasculature-pericytes',
        'vasculature-endothelial',
      ]);

      const postUncheckTree = reducer(postCheckTree, {
        type: ACTION.CHECK_NODE,
        targetKey: 'vasculature-pericytes',
        checked: false,
      });
      expect(postUncheckTree._state.checkedKeys).toEqual([
        'vasculature-endothelial',
      ]);
    });

    it('can un-check non-leaf nodes', () => {
      const initialTree = tree;
      expect(initialTree._state.checkedKeys).toEqual([]);

      const postCheckTree = reducer(initialTree, {
        type: ACTION.CHECK_NODE,
        targetKey: 'vasculature',
        checked: true,
      });
      expect(postCheckTree._state.checkedKeys).toEqual([
        'vasculature',
        'vasculature-pericytes',
        'vasculature-endothelial',
      ]);

      const postUncheckTree = reducer(postCheckTree, {
        type: ACTION.CHECK_NODE,
        targetKey: 'vasculature',
        checked: false,
      });
      expect(postUncheckTree._state.checkedKeys).toEqual([]);
    });

    it('can set the current set', () => {
      
    });

    it('can start editing a node', () => {
     
    });

    it('can delete a leaf node', () => {
      const initialTree = tree;
      expect(initialTree.tree[0].children[0].children.length).toEqual(2);
      const postDeleteTree = reducer(initialTree, {
        type: ACTION.REMOVE_NODE,
        targetKey: 'vasculature-pericytes',
      });
      expect(postDeleteTree.tree[0].children[0].children.length).toEqual(1);
    });

    it('can delete a non-leaf node', () => {
      const initialTree = tree;
      expect(initialTree.tree.length).toEqual(1);
      const postDeleteTree = reducer(initialTree, {
        type: ACTION.REMOVE_NODE,
        targetKey: 'cell-type-annotations',
      });
      expect(postDeleteTree.tree.length).toEqual(0);
    });

    it('can change a node name', () => {
      const initialTree = tree;
      expect(initialTree.tree[0].children[0].name).toEqual("Vasculature");
      const postRenameTree = reducer(initialTree, {
        type: ACTION.SET_NODE_NAME,
        targetKey: 'vasculature',
        name: 'New Name',
        stopEditing: true,
      });
      expect(postRenameTree.tree[0].children[0].name).toEqual('New Name');
    });

    it('can create a level zero node', () => {
      const initialTree = tree;
      expect(initialTree.tree.length).toEqual(1);
      const postCreateTree = reducer(initialTree, {
        type: ACTION.CREATE_LEVEL_ZERO_NODE,
      });
      expect(postCreateTree.tree.length).toEqual(2);
    });

    it('can change node color', () => {
      const initialTree = tree;
      expect(initialTree.tree[0].children[0].color).toEqual([0, 255, 0]);
      const postRecolorTree = reducer(initialTree, {
        type: ACTION.SET_NODE_COLOR,
        targetKey: 'vasculature',
        color: [1, 2, 3]
      });
      expect(postRecolorTree.tree[0].children[0].color).toEqual([1, 2, 3]);
    });

    it('can view expanded descendant sets of a non-leaf node', () => {
      
    });

    it('can do a union operation', () => {
      
    });

    it('can do an intersection operation', () => {
      
    });

    it('can do a complement operation', () => {
      
    });

    it('can move a drag node to a drop node, making drag node the only child of drop node', () => {
      
    });

    it('can move a drag node to a drop node, making drag node the last child of drop node', () => {
      
    });

    it('can move a drag node up, below a drop node, into the gap between two nodes', () => {
      
    });

    it('can move a drag node up, above a drop node, into the gap between two nodes', () => {
      
    });

    it('can move a drag node up, above a drop node that is a first child', () => {
      
    });

    it('can move a drag node down, above a drop node, into the gap between two nodes', () => {
      
    });

    it('can move a drag node down, below a drop node that is a last child', () => {
     
    });

    it('can move a drag node up a level, below its parent node', () => {
     
    });

    it('can move a drag node up a level, above its parent node', () => {
      
    });

    it('can view a leaf node set', () => {
      
    });

  });
});


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

      // Also check that it assigns the correct level.
      expect(postImportTree.tree[0]._state.level).toEqual(0);
      expect(postImportTree.tree[0].children[0]._state.level).toEqual(1);
      expect(postImportTree.tree[0].children[0].children[0]._state.level).toEqual(2);
      expect(postImportTree.tree[0].children[0].children[1]._state.level).toEqual(2);
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

    it('can set the current selection', () => {
      const initialTree = tree;
      expect(initialTree.tree.length).toEqual(1);
      const postSelectionTree = reducer(initialTree, {
        type: ACTION.SET_CURRENT_SET,
        cellIds: ["cell_x", "cell_y", "cell_z"],
      });
      // Expect the current selection set to the the only one visible.
      expect(postSelectionTree._state.visibleKeys.length).toEqual(1);
      // Expect there to be one additional expanded set
      // (corresponding to the .isForTools node).
      expect(postSelectionTree._state.expandedKeys.length).toEqual(1);

      // Expect there to be an additional level zero node.
      expect(postSelectionTree.tree.length).toEqual(2);
      expect(postSelectionTree.tree[1].name).toEqual('My Selections');
      expect(postSelectionTree.tree[1]._state.isForTools).toEqual(true);
      expect(postSelectionTree.tree[1]._state.level).toEqual(0);
      expect(postSelectionTree.tree[0]._state.isForTools).toEqual(false);
      expect(postSelectionTree.tree[1].children.length).toEqual(1);
      expect(postSelectionTree.tree[1].children[0].name).toEqual('Current selection');
      expect(postSelectionTree.tree[1].children[0]._state.isCurrent).toEqual(true);
      expect(postSelectionTree.tree[1].children[0]._state.level).toEqual(1);
      expect(postSelectionTree.tree[1].children[0].set).toEqual(["cell_x", "cell_y", "cell_z"]);
    });

    it('can start editing a node', () => {
      const initialTree = tree;
      const editingTree = reducer(initialTree, {
        type: ACTION.SET_NODE_IS_EDITING,
        targetKey: 'vasculature-endothelial',
        value: true,
      });
      expect(editingTree.tree[0].children[0].children[0]._state.isEditing).toEqual(false);
      expect(editingTree.tree[0].children[0].children[1]._state.isEditing).toEqual(true);
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
      const initialTree = tree;
      expect(initialTree._state.expandedKeys).toEqual([]);
      const postExpandTree = reducer(initialTree, {
        type: ACTION.EXPAND_NODE,
        expandedKeys: ['cell-type-annotations'],
        targetKey: 'cell-type-annotations',
        expanded: true
      });
      expect(postExpandTree._state.expandedKeys).toEqual(['cell-type-annotations']);
    });

    it('can view a leaf node set', () => {
      const initialTree = tree;
      expect(initialTree._state.visibleKeys).toEqual([]);
      const postViewTree = reducer(initialTree, {
        type: ACTION.VIEW_NODE,
        targetKey: 'vasculature-endothelial',
      });
      expect(postViewTree._state.visibleKeys).toEqual(['vasculature-endothelial']);
    });

    it('can do a union operation', () => {
      const initialTree = tree;
      expect(initialTree.tree.length).toEqual(1);
      const postCheckTree = reducer(initialTree, {
        type: ACTION.CHECK_NODE,
        targetKey: 'vasculature-endothelial',
        checked: true,
      });
      const postSecondCheckTree = reducer(postCheckTree, {
        type: ACTION.CHECK_NODE,
        targetKey: 'vasculature-pericytes',
        checked: true,
      });
      const postUnionTree = reducer(postSecondCheckTree, {
        type: ACTION.UNION_CHECKED,
      });
      expect(postUnionTree.tree.length).toEqual(2);
      expect(postUnionTree.tree[1].name).toEqual('My Selections');
      expect(postUnionTree.tree[1]._state.isForTools).toEqual(true);
      expect(postUnionTree.tree[1].children[0].name).toEqual('Current union');
      expect(postUnionTree.tree[1].children[0]._state.isCurrent).toEqual(true);
      expect(postUnionTree.tree[1].children[0]._state.level).toEqual(1);
      expect(postUnionTree.tree[1].children[0].set).toEqual([
        "cell_3", "cell_4", "cell_5", "cell_1", "cell_2"
      ]);
      expect(postUnionTree._state.visibleKeys.length).toEqual(1);
    });

    it('can do an intersection operation', () => {
      const initialTree = tree;
      expect(initialTree.tree.length).toEqual(1);
      const postCheckTree = reducer(initialTree, {
        type: ACTION.CHECK_NODE,
        targetKey: 'vasculature-endothelial',
        checked: true,
      });
      const postSecondCheckTree = reducer(postCheckTree, {
        type: ACTION.CHECK_NODE,
        targetKey: 'vasculature-pericytes',
        checked: true,
      });
      const postIntersectionTree = reducer(postSecondCheckTree, {
        type: ACTION.INTERSECTION_CHECKED,
      });
      expect(postIntersectionTree.tree.length).toEqual(2);
      expect(postIntersectionTree.tree[1].name).toEqual('My Selections');
      expect(postIntersectionTree.tree[1]._state.isForTools).toEqual(true);
      expect(postIntersectionTree.tree[1].children[0].name).toEqual('Current intersection');
      expect(postIntersectionTree.tree[1].children[0]._state.isCurrent).toEqual(true);
      expect(postIntersectionTree.tree[1].children[0]._state.level).toEqual(1);
      expect(postIntersectionTree.tree[1].children[0].set).toEqual([
        "cell_3"
      ]);
      expect(postIntersectionTree._state.visibleKeys.length).toEqual(1);
    });

    it('can do a complement operation', () => {
      const initialTree = tree;
      expect(initialTree.tree.length).toEqual(1);
      const postCheckTree = reducer(initialTree, {
        type: ACTION.CHECK_NODE,
        targetKey: 'vasculature-endothelial',
        checked: true,
      });
      const postSecondCheckTree = reducer(postCheckTree, {
        type: ACTION.CHECK_NODE,
        targetKey: 'vasculature-pericytes',
        checked: true,
      });
      const postIntersectionTree = reducer(postSecondCheckTree, {
        type: ACTION.COMPLEMENT_CHECKED,
      });
      expect(postIntersectionTree.tree.length).toEqual(2);
      expect(postIntersectionTree.tree[1].name).toEqual('My Selections');
      expect(postIntersectionTree.tree[1]._state.isForTools).toEqual(true);
      expect(postIntersectionTree.tree[1].children[0].name).toEqual('Current complement');
      expect(postIntersectionTree.tree[1].children[0]._state.isCurrent).toEqual(true);
      expect(postIntersectionTree.tree[1].children[0]._state.level).toEqual(1);
      expect(postIntersectionTree.tree[1].children[0].set).toEqual([
        "cell_6"
      ]);
      expect(postIntersectionTree._state.visibleKeys.length).toEqual(1);
    });

    it('can drag to rearrange leaf nodes, dragging to top of list', () => {
      const initialTree = tree;
      expect(initialTree.tree[0].children[0].children[0]._state.key).toEqual('vasculature-pericytes');
      expect(initialTree.tree[0].children[0].children[1]._state.key).toEqual('vasculature-endothelial');
      const postDragNode = reducer(initialTree, {
        type: ACTION.DROP_NODE,
        dropKey: 'vasculature-pericytes',
        dragKey: 'vasculature-endothelial',
        dropPosition: -1,
        dropToGap: true,
      });
      expect(postDragNode.tree[0].children[0].children[0]._state.key).toEqual('vasculature-endothelial');
      expect(postDragNode.tree[0].children[0].children[1]._state.key).toEqual('vasculature-pericytes');
    });

    it('can drag to rearrange leaf nodes, dragging to bottom of list', () => {
      const initialTree = tree;
      expect(initialTree.tree[0].children[0].children[0]._state.key).toEqual('vasculature-pericytes');
      expect(initialTree.tree[0].children[0].children[1]._state.key).toEqual('vasculature-endothelial');
      const postDragNode = reducer(initialTree, {
        type: ACTION.DROP_NODE,
        dropKey: 'vasculature-endothelial',
        dragKey: 'vasculature-pericytes',
        dropPosition: 2,
        dropToGap: true,
      });
      expect(postDragNode.tree[0].children[0].children[0]._state.key).toEqual('vasculature-endothelial');
      expect(postDragNode.tree[0].children[0].children[1]._state.key).toEqual('vasculature-pericytes');
    });
  });
});


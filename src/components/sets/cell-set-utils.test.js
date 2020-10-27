/* eslint-disable no-underscore-dangle */
import expect from 'expect';
import { cloneDeep } from 'lodash';

import {
  nodeToRenderProps,
  nodeToSet,
  nodeToHeight,
  treeFindNodeByNamePath,
  nodeTransform,
  treeToUnion,
  treeToIntersection,
  treeToComplement,
  nodeToLevelDescendantNamePaths,
  treeExport,
} from './cell-set-utils';

import {
  levelTwoNodeLeaf,
  levelZeroNode,
  levelZeroNodeWithoutState,
  levelTwoNodeLeafWithoutState,
  tree,
} from './cell-set-utils.test.fixtures';


describe('Hierarchical sets cell-set-utils', () => {
  describe('Node rendering', () => {
    it('can get render properties for a node', () => {
      const levelTwoRenderProps = nodeToRenderProps(levelTwoNodeLeaf);

      expect(levelTwoRenderProps.title).toEqual('Pericytes');
      expect(levelTwoRenderProps.nodeKey).toEqual('pericytes');
      expect(levelTwoRenderProps.size).toEqual(undefined);
      expect(levelTwoRenderProps.color).toEqual([255, 0, 0]);
      expect(levelTwoRenderProps.level).toEqual(2);
      expect(levelTwoRenderProps.isEditing).toEqual(false);
      expect(levelTwoRenderProps.isCurrentSet).toEqual(false);
      expect(levelTwoRenderProps.isForTools).toEqual(false);
      expect(levelTwoRenderProps.isLeaf).toEqual(undefined);
      expect(levelTwoRenderProps.height).toEqual(0);

      const levelZeroRenderProps = nodeToRenderProps(levelZeroNode);

      expect(levelZeroRenderProps.title).toEqual('Cell Type Annotations');
      expect(levelZeroRenderProps.nodeKey).toEqual('cell-type-annotations');
      expect(levelZeroRenderProps.size).toEqual(undefined);
      expect(levelZeroRenderProps.color).toEqual(undefined);
      expect(levelZeroRenderProps.level).toEqual(0);
      expect(levelZeroRenderProps.isEditing).toEqual(false);
      expect(levelZeroRenderProps.isCurrentSet).toEqual(false);
      expect(levelZeroRenderProps.isForTools).toEqual(false);
      expect(levelZeroRenderProps.isLeaf).toEqual(undefined);
      expect(levelZeroRenderProps.height).toEqual(2);
    });
  });

  describe('Get derived Node properties', () => {
    it('Get children set for Node', () => {
      const nodeSet = nodeToSet(levelZeroNodeWithoutState);
      expect(nodeSet).toEqual([['cell_1', null], ['cell_2', null], ['cell_3', null], ['cell_4', null], ['cell_5', null], ['cell_6', null]]);
    });

    it('Get height for Node', () => {
      const nodeHeight = nodeToHeight(levelZeroNodeWithoutState);
      expect(nodeHeight).toEqual(2);

      const nodeHeightZero = nodeToHeight(levelTwoNodeLeafWithoutState);
      expect(nodeHeightZero).toEqual(0);
    });

    it('Get Node by Path', () => {
      const node = treeFindNodeByNamePath(tree, ['Cell Type Annotations', 'Vasculature', 'Pericytes']);
      expect(node._state.nodeKey).toEqual('vasculature-pericytes');

      const noNode = treeFindNodeByNamePath(tree, ['Cell Type Annotations', 'Foo', 'Bar']);
      expect(noNode).toEqual(null);
    });
  });

  describe('Alter Node properties', () => {
    it('Node Transform', () => {
      const nodeTransformedWithPredicate = nodeTransform(
        cloneDeep(levelZeroNodeWithoutState),
        node => node.name === 'Vasculature',
        // eslint-disable-next-line no-param-reassign
        (node) => { node._state.color = [255, 255, 255]; return node; },
      );
      // Node matching predicate is transformed but none others
      expect(nodeTransformedWithPredicate.children[0]._state.color).toEqual([255, 255, 255]);
      expect(
        nodeTransformedWithPredicate.children[0].children[0]._state.color,
      ).toEqual([255, 0, 0]);

      // eslint-disable-next-line no-param-reassign
      const nodeTransformedWithoutPredicate = nodeTransform(
        cloneDeep(levelZeroNodeWithoutState),
        () => false,
        // eslint-disable-next-line no-param-reassign
        (node) => { node._state.color = [255, 255, 255]; return node; },
      );
      // No nodes transformed for fals-y predicate.
      expect(nodeTransformedWithoutPredicate.children[0]._state.color).toEqual([0, 255, 0]);
      expect(
        nodeTransformedWithoutPredicate.children[0].children[0]._state.color,
      ).toEqual([255, 0, 0]);
    });
  });

  describe('Get from tree', () => {
    it('Tree Union', () => {
      const union = treeToUnion(
        tree,
        [
          ['Cell Type Annotations', 'Vasculature', 'Endothelial'],
          ['Cell Type Annotations', 'Vasculature', 'Epithelial', 'Squamous'],
        ],
      );
      expect(union).toEqual(['cell_3', 'cell_4', 'cell_5', 'cell_6', 'cell_7']);
    });

    it('Tree Intersection', () => {
      const union = treeToIntersection(
        tree,
        [
          ['Cell Type Annotations', 'Vasculature', 'Endothelial'],
          ['Cell Type Annotations', 'Vasculature', 'Epithelial', 'Squamous'],
        ],
      );
      expect(union).toEqual(['cell_5']);
    });

    it('Tree Union Complement', () => {
      const complement = treeToComplement(
        tree,
        [
          ['Cell Type Annotations', 'Vasculature', 'Endothelial'],
          ['Cell Type Annotations', 'Vasculature', 'Epithelial', 'Squamous'],
        ],
        ['cell_6', 'cell_7', 'cell_8'],
      );
      expect(complement).toEqual(['cell_8']);
    });

    it('Node Descendants by Level', () => {
      const descendants = nodeToLevelDescendantNamePaths(tree.tree[0], 2, []);
      expect(descendants).toEqual([['Cell Type Annotations', 'Vasculature', 'Epithelial']]);

      const descendantsStopEarly = nodeToLevelDescendantNamePaths(tree.tree[0], 2, [], true);
      expect(descendantsStopEarly).toEqual(
        [['Cell Type Annotations', 'Vasculature', 'Pericytes'],
          ['Cell Type Annotations', 'Vasculature', 'Endothelial'],
          ['Cell Type Annotations', 'Vasculature', 'Epithelial']],
      );
    });

    it('Tree export', () => {
      const exportedTree = treeExport(tree, 'cell');
      // Clears state going deeply
      expect(exportedTree.tree[0].children[0]._state).toEqual(undefined);
      expect(exportedTree.tree[0].children[0].children[0]._state).toEqual(undefined);
      // Tree still has same names for nodes
      expect(exportedTree.tree[0].children[0].name).toEqual(tree.tree[0].children[0].name);
      expect(exportedTree.tree[0].children[0].children[0].name)
        .toEqual(tree.tree[0].children[0].children[0].name);
    });
  });
});

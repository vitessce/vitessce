/* eslint-disable no-underscore-dangle */
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
  filterNode,
  isEqualSet,
  isPartialSet,
  isFullSubSet,
} from './cell-set-utils';

import {
  levelTwoNodeLeaf,
  levelZeroNode,
  tree,
} from './cell-set-utils.test.fixtures';


describe('Hierarchical sets cell-set-utils', () => {
  describe('Node rendering', () => {
    it('can get render properties for a node', () => {
      const levelTwoRenderProps = nodeToRenderProps(levelTwoNodeLeaf, ['Cell Type Annotations', 'Vasculature', 'Pericytes'], [{
        path: ['Cell Type Annotations', 'Vasculature', 'Pericytes'],
        color: [255, 0, 0],
      }]);

      expect(levelTwoRenderProps.title).toEqual('Pericytes');
      expect(levelTwoRenderProps.size).toEqual(3);
      expect(levelTwoRenderProps.color).toEqual([255, 0, 0]);
      expect(levelTwoRenderProps.level).toEqual(2);
      expect(levelTwoRenderProps.isLeaf).toEqual(true);
      expect(levelTwoRenderProps.height).toEqual(0);

      const levelZeroRenderProps = nodeToRenderProps(levelZeroNode, ['Cell Type Annotations'], []);

      expect(levelZeroRenderProps.title).toEqual('Cell Type Annotations');
      expect(levelZeroRenderProps.size).toEqual(6);
      expect(levelZeroRenderProps.color).toEqual(undefined);
      expect(levelZeroRenderProps.level).toEqual(0);
      expect(levelZeroRenderProps.isLeaf).toEqual(false);
      expect(levelZeroRenderProps.height).toEqual(2);
    });
  });

  describe('Get derived Node properties', () => {
    it('Get children set for Node', () => {
      const nodeSet = nodeToSet(levelZeroNode);
      expect(nodeSet).toEqual([['cell_1', null], ['cell_2', null], ['cell_3', null], ['cell_4', null], ['cell_5', null], ['cell_6', null]]);
    });

    it('Get height for Node', () => {
      const nodeHeight = nodeToHeight(levelZeroNode);
      expect(nodeHeight).toEqual(2);

      const nodeHeightZero = nodeToHeight(levelTwoNodeLeaf);
      expect(nodeHeightZero).toEqual(0);
    });

    it('Get Node by Path', () => {
      const node = treeFindNodeByNamePath(tree, ['Cell Type Annotations', 'Vasculature', 'Pericytes']);
      expect(node.name).toEqual('Pericytes');

      const noNode = treeFindNodeByNamePath(tree, ['Cell Type Annotations', 'Foo', 'Bar']);
      expect(noNode).toEqual(null);
    });

    it('Filter node by path', () => {
      const node = tree.tree[0];
      const newNodeFiltered = filterNode(node, [], ['Cell Type Annotations', 'Vasculature', 'Pericytes']);
      // eslint-disable-next-line no-return-assign
      expect(newNodeFiltered.children[0].children.findIndex(i => i.name === 'Pericytes')).toEqual(-1);

      const vasculatureNode = tree.tree[0].children.find(i => i.name === 'Vasculature');
      const newNodeFilteredFromLevel1 = filterNode(vasculatureNode, ['Cell Type Annotations'], ['Cell Type Annotations', 'Vasculature', 'Pericytes']);
      expect(newNodeFilteredFromLevel1.children.findIndex(i => i.name === 'Pericytes')).toEqual(-1);
    });
  });

  describe('Alter Node properties', () => {
    it('Node Transform', () => {
      const nodeTransformedWithPredicate = nodeTransform(
        cloneDeep(levelZeroNode),
        node => node.name === 'Pericytes',
        // eslint-disable-next-line no-param-reassign
        (node) => { node.name = 'New name'; return node; },
        [],
        ['Cell Type Annotations'],
      );
      // Node matching predicate is transformed but none others
      expect(nodeTransformedWithPredicate.name).toEqual('Cell Type Annotations');
      expect(
        nodeTransformedWithPredicate.children[0].children[0].name,
      ).toEqual('New name');

      // eslint-disable-next-line no-param-reassign
      const nodeTransformedWithoutPredicate = nodeTransform(
        cloneDeep(levelZeroNode),
        () => false,
        // eslint-disable-next-line no-param-reassign
        (node) => { node.name = 'New name'; return node; },
        [],
        ['Cell Type Annotations'],
      );
      // No nodes transformed for fals-y predicate.
      expect(nodeTransformedWithoutPredicate.name).toEqual('Cell Type Annotations');
      expect(
        nodeTransformedWithoutPredicate.children[0].children[0].name,
      ).toEqual('Pericytes');
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
  describe('Set equality helpers', () => {
    it('isEqualSet returns true when two sets of paths contain the same elements', () => {
      const a = [
        ['k-means Clustering', 'Cluster 1'],
        ['k-means Clustering', 'Cluster 2'],
        ['k-means Clustering', 'Cluster 3'],
      ];
      const b = [
        ['k-means Clustering', 'Cluster 1'],
        ['k-means Clustering', 'Cluster 2'],
        ['k-means Clustering', 'Cluster 3'],
      ];

      expect(isEqualSet(a, b)).toEqual(true);
    });
    it('isEqualSet and isPartialSet are correct when two sets of paths are different', () => {
      const a = [
        ['k-means Clustering', 'Cluster 1'],
        ['k-means Clustering', 'Cluster 2'],
        ['k-means Clustering', 'Cluster 3'],
      ];
      const b = [
        ['k-means Clustering', 'Cluster 1'],
        ['k-means Clustering', 'Cluster 2'],
      ];
      const c = [
        ['Leiden Clustering', 'Cluster 1'],
        ['Leiden Clustering', 'Cluster 2'],
        ['Leiden Clustering', 'Cluster 3'],
      ];

      expect(isEqualSet(a, b)).toEqual(false);
      expect(isEqualSet(b, a)).toEqual(false);

      expect(isPartialSet(a, b)).toEqual(true);
      expect(isPartialSet(a, [])).toEqual(false);
      expect(isPartialSet(b, a)).toEqual(true);
      expect(isPartialSet(a, c)).toEqual(false);

      expect(isFullSubSet(a, b)).toEqual(false);
      expect(isFullSubSet(b, a)).toEqual(true);
      expect(isFullSubSet(a, c)).toEqual(false);
      expect(isFullSubSet(c, a)).toEqual(false);
      expect(isFullSubSet(a, [])).toEqual(false);
      expect(isFullSubSet([], a)).toEqual(false);
      expect(isFullSubSet([], [])).toEqual(false);
    });
  });
});

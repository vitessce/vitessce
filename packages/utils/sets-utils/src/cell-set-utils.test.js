/* eslint-disable no-underscore-dangle */
import { describe, it, expect } from 'vitest';
import { cloneDeep } from 'lodash-es';

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
  treeToSetSizesBySetNames,
} from './cell-set-utils.js';

import {
  levelTwoNodeLeaf,
  levelZeroNode,
  tree,
} from './cell-set-utils.test.fixtures.js';

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

  describe('Generate properties from paths', () => {
    it('treeToSetSizesBySetNames where one bar is selected', () => {
      const setColor = [
        {
          path: ['Cell Type Annotations', 'Vasculature', 'Endothelial'],
          color: [255, 0, 0],
        },
        {
          path: ['Cell Type Annotations', 'Vasculature'],
          color: [68, 119, 170],
        },
      ];
      const setSizes = treeToSetSizesBySetNames(
        tree,
        [['Cell Type Annotations', 'Vasculature', 'Endothelial'], ['Cell Type Annotations', 'Vasculature']],
        [['Cell Type Annotations', 'Vasculature', 'Endothelial']],
        setColor,
        'dark',
      );

      expect(setSizes.length).toEqual(2);
      expect(setSizes[0].name).toEqual('Endothelial');
      expect(setSizes[0].size).toEqual(3);
      expect(setSizes[0].color).toEqual([255, 0, 0]);
      expect(setSizes[0].isGrayedOut).toEqual(false);
      expect(setSizes[0].setNamePath).toEqual(['Cell Type Annotations', 'Vasculature', 'Endothelial']);

      expect(setSizes[1].name).toEqual('Vasculature');
      expect(setSizes[1].size).toEqual(9);
      expect(setSizes[1].color).toEqual([68, 119, 170]);
      expect(setSizes[1].isGrayedOut).toEqual(true);
    });

    it('treeToSetSizesBySetNames where nothing is selected', () => {
      const setColor = [
        {
          path: ['Cell Type Annotations', 'Vasculature', 'Endothelial'],
          color: [255, 0, 0],
        },
        {
          path: ['Cell Type Annotations', 'Vasculature'],
          color: [68, 119, 170],
        },
      ];
      const setSizes = treeToSetSizesBySetNames(
        tree,
        [['Cell Type Annotations', 'Vasculature', 'Endothelial'], ['Cell Type Annotations', 'Vasculature']],
        [],
        setColor,
        'dark',
      );

      expect(setSizes.length).toEqual(2);
      expect(setSizes[0].name).toEqual('Endothelial');
      expect(setSizes[0].size).toEqual(3);
      expect(setSizes[0].color).toEqual([255, 0, 0]);
      expect(setSizes[0].isGrayedOut).toEqual(true);
      expect(setSizes[0].setNamePath).toEqual(['Cell Type Annotations', 'Vasculature', 'Endothelial']);

      expect(setSizes[1].name).toEqual('Vasculature');
      expect(setSizes[1].size).toEqual(9);
      expect(setSizes[1].color).toEqual([68, 119, 170]);
      expect(setSizes[1].isGrayedOut).toEqual(true);
      expect(setSizes[1].setNamePath).toEqual(['Cell Type Annotations', 'Vasculature']);
    });

    it('treeToSetSizesBySetNames where selected paths are not part of all paths', () => {
      const setColor = [
        {
          path: ['Cell Type Annotations', 'Vasculature', 'Endothelial'],
          color: [255, 0, 0],
        },
        {
          path: ['Cell Type Annotations', 'Vasculature'],
          color: [68, 119, 170],
        },
      ];
      const setSizes = treeToSetSizesBySetNames(
        tree,
        [['Cell Type Annotations', 'Vasculature', 'Endothelial'], ['Cell Type Annotations', 'Vasculature']],
        [['Louvain Clusters', '0'], ['Louvain Clusters', '1']],
        setColor,
        'dark',
      );

      expect(setSizes.length).toEqual(2);
      expect(setSizes[0].name).toEqual('Endothelial');
      expect(setSizes[0].size).toEqual(3);
      expect(setSizes[0].color).toEqual([255, 0, 0]);
      expect(setSizes[0].isGrayedOut).toEqual(true);
      expect(setSizes[0].setNamePath).toEqual(['Cell Type Annotations', 'Vasculature', 'Endothelial']);

      expect(setSizes[1].name).toEqual('Vasculature');
      expect(setSizes[1].size).toEqual(9);
      expect(setSizes[1].color).toEqual([68, 119, 170]);
      expect(setSizes[1].isGrayedOut).toEqual(true);
      expect(setSizes[1].setNamePath).toEqual(['Cell Type Annotations', 'Vasculature']);
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

/* eslint-disable no-underscore-dangle */
import { describe, it, expect } from 'vitest';
import { cloneDeep } from 'lodash-es';
import { MISSING_VALUE_PLACEHOLDER } from '@vitessce/utils';

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
  treeToCellColorsBySetNames,
  treeToSelectedSetMap,
  treeToCellSetColorIndicesBySetNames,
  treeToObjectsBySetNames,
  treeToColorIndicesArray,
  colorIndicesFromCodes,
  getObsIndexMap,
  treeToMembershipMap,
} from './cell-set-utils.js';
import { codesToCellSetsTree } from './CellSetsZarrLoader.js';

import {
  levelTwoNodeLeaf,
  levelZeroNode,
  tree,
  treeWithScores,
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

  describe('Map observations to colors by set', () => {
    const PERICYTES = ['Cell Type Annotations', 'Vasculature', 'Pericytes'];
    const ENDOTHELIAL = ['Cell Type Annotations', 'Vasculature', 'Endothelial'];
    const MISSING = ['Cell Type Annotations', 'Vasculature', 'Does Not Exist'];
    // Pericytes and Endothelial both contain cell_3, so the later selected path wins.
    const setColor = [
      { path: PERICYTES, color: [255, 0, 0] },
      { path: ENDOTHELIAL, color: [0, 255, 0] },
    ];

    it('treeToCellColorsBySetNames assigns each set its color', () => {
      const cellColors = treeToCellColorsBySetNames(
        tree, [PERICYTES, ENDOTHELIAL], setColor, 'light',
      );
      expect(cellColors.size).toEqual(5);
      expect(cellColors.get('cell_1')).toEqual([255, 0, 0]);
      expect(cellColors.get('cell_2')).toEqual([255, 0, 0]);
      // cell_3 is in both sets; the later path in selectedNamePaths wins.
      expect(cellColors.get('cell_3')).toEqual([0, 255, 0]);
      expect(cellColors.get('cell_4')).toEqual([0, 255, 0]);
      expect(cellColors.get('cell_5')).toEqual([0, 255, 0]);
    });

    it('treeToCellColorsBySetNames falls back to the theme default color', () => {
      const cellColors = treeToCellColorsBySetNames(tree, [PERICYTES], [], 'light');
      expect(cellColors.get('cell_1')).toEqual([200, 200, 200]);
    });

    it('treeToCellColorsBySetNames mixes in per-observation uncertainty', () => {
      const cellColors = treeToCellColorsBySetNames(
        treeWithScores,
        [['Cell Type Annotations', 'Pericytes']],
        [{ path: ['Cell Type Annotations', 'Pericytes'], color: [255, 0, 0] }],
        'light',
      );
      // A score of 1.0 keeps the set color, 0.0 collapses to the [128, 128, 128]
      // mixing color, and 0.5 lands halfway between.
      expect(cellColors.get('cell_1')).toEqual([255, 0, 0]);
      expect(cellColors.get('cell_2')).toEqual([191.5, 64, 64]);
      expect(cellColors.get('cell_3')).toEqual([128, 128, 128]);
    });

    it('treeToCellColorsBySetNames skips paths absent from the tree', () => {
      const cellColors = treeToCellColorsBySetNames(
        tree, [PERICYTES, MISSING], setColor, 'light',
      );
      expect(cellColors.size).toEqual(3);
      expect(treeToCellColorsBySetNames(tree, [], setColor, 'light').size).toEqual(0);
    });

    it('treeToSelectedSetMap maps each observation to its set path', () => {
      const setMap = treeToSelectedSetMap(tree, [PERICYTES, ENDOTHELIAL]);
      expect(setMap.size).toEqual(5);
      expect(setMap.get('cell_1')).toEqual(PERICYTES);
      expect(setMap.get('cell_3')).toEqual(ENDOTHELIAL);
      expect(treeToSelectedSetMap(tree, [MISSING]).size).toEqual(0);
    });

    it('treeToCellSetColorIndicesBySetNames maps observations to palette indices', () => {
      const colorIndices = treeToCellSetColorIndicesBySetNames(
        tree, [PERICYTES, ENDOTHELIAL], setColor,
      );
      expect(colorIndices.size).toEqual(5);
      expect(colorIndices.get('cell_1')).toEqual(0);
      expect(colorIndices.get('cell_3')).toEqual(1);
      expect(colorIndices.get('cell_5')).toEqual(1);
    });

    it('treeToCellSetColorIndicesBySetNames tolerates a null selection', () => {
      expect(treeToCellSetColorIndicesBySetNames(tree, null, setColor).size).toEqual(0);
    });

    it('treeToObjectsBySetNames returns one entry per set membership', () => {
      const objects = treeToObjectsBySetNames(tree, [PERICYTES, ENDOTHELIAL], setColor, 'light');
      // An array rather than a Map, so cell_3 appears once per set it belongs to.
      expect(objects.length).toEqual(6);
      expect(objects[0]).toEqual({ obsId: 'cell_1', name: 'Pericytes', color: [255, 0, 0] });
      expect(objects[3]).toEqual({ obsId: 'cell_3', name: 'Endothelial', color: [0, 255, 0] });
      expect(objects.filter(d => d.obsId === 'cell_3').length).toEqual(2);
      expect(treeToObjectsBySetNames(tree, [], setColor, 'light')).toEqual([]);
    });
  });

  describe('Positionally-indexed set colors', () => {
    const PERICYTES = ['Cell Type Annotations', 'Vasculature', 'Pericytes'];
    const ENDOTHELIAL = ['Cell Type Annotations', 'Vasculature', 'Endothelial'];
    const setColor = [
      { path: PERICYTES, color: [255, 0, 0] },
      { path: ENDOTHELIAL, color: [0, 255, 0] },
    ];
    // cell_6 and cell_7 are in the observation index but in neither selected set.
    const obsIndex = ['cell_1', 'cell_2', 'cell_3', 'cell_4', 'cell_5', 'cell_6', 'cell_7'];

    it('getObsIndexMap maps IDs to positions and memoizes on the array', () => {
      const map = getObsIndexMap(obsIndex);
      expect(map.get('cell_1')).toEqual(0);
      expect(map.get('cell_7')).toEqual(6);
      // Same array reference returns the very same Map, so views can share it.
      expect(getObsIndexMap(obsIndex)).toBe(map);
      expect(getObsIndexMap([...obsIndex])).not.toBe(map);
    });

    it('treeToColorIndicesArray aligns indices to obsIndex positions', () => {
      const { colorIndices, colorProbs, colors } = treeToColorIndicesArray(
        tree, [PERICYTES, ENDOTHELIAL], setColor, obsIndex, 'light',
      );
      expect(colors).toEqual([[255, 0, 0], [0, 255, 0]]);
      // 0 means "in no selected set"; cell_3 is in both, so the later path wins.
      expect(Array.from(colorIndices)).toEqual([1, 1, 2, 2, 2, 0, 0]);
      expect(colorProbs).toEqual(null);
      // Small selections fit in the narrowest typed array.
      expect(colorIndices.BYTES_PER_ELEMENT).toEqual(1);
    });

    it('treeToColorIndicesArray agrees with treeToCellColorsBySetNames', () => {
      const paths = [PERICYTES, ENDOTHELIAL];
      const cellColors = treeToCellColorsBySetNames(tree, paths, setColor, 'light');
      const { colorIndices, colors } = treeToColorIndicesArray(
        tree, paths, setColor, obsIndex, 'light',
      );
      obsIndex.forEach((obsId, i) => {
        const expected = cellColors.get(obsId) || [200, 200, 200];
        const actual = colorIndices[i] === 0 ? [200, 200, 200] : colors[colorIndices[i] - 1];
        expect(actual).toEqual(expected);
      });
    });

    it('treeToColorIndicesArray carries per-observation confidence scores', () => {
      const path = ['Cell Type Annotations', 'Pericytes'];
      const { colorIndices, colorProbs } = treeToColorIndicesArray(
        treeWithScores, [path], [{ path, color: [255, 0, 0] }],
        ['cell_1', 'cell_2', 'cell_3', 'cell_4'], 'light',
      );
      expect(Array.from(colorIndices)).toEqual([1, 1, 1, 0]);
      // Observations outside any scored set default to full confidence.
      expect(Array.from(colorProbs)).toEqual([1, 0.5, 0, 1]);
    });

    it('treeToColorIndicesArray keeps colors aligned when a path is absent', () => {
      const MISSING = ['Cell Type Annotations', 'Vasculature', 'Does Not Exist'];
      const { colorIndices, colors } = treeToColorIndicesArray(
        tree, [MISSING, PERICYTES], setColor, obsIndex, 'light',
      );
      // The missing path still consumes index 1, so Pericytes must land on index 2.
      expect(colors.length).toEqual(2);
      expect(Array.from(colorIndices)).toEqual([2, 2, 2, 0, 0, 0, 0]);
      expect(colors[colorIndices[0] - 1]).toEqual([255, 0, 0]);
    });

    it('treeToColorIndicesArray handles empty and absent inputs', () => {
      const empty = treeToColorIndicesArray(tree, [], setColor, obsIndex, 'light');
      expect(Array.from(empty.colorIndices)).toEqual([0, 0, 0, 0, 0, 0, 0]);
      expect(treeToColorIndicesArray(tree, null, setColor, obsIndex, 'light').colors)
        .toEqual([]);
      const noObs = treeToColorIndicesArray(tree, [PERICYTES], setColor, [], 'light');
      expect(noObs.colorIndices.length).toEqual(0);
      // The palette is still built, so it stays usable regardless of obsIndex.
      expect(noObs.colors).toEqual([[255, 0, 0]]);
      // Observations in a selected set but absent from obsIndex are skipped.
      const partial = treeToColorIndicesArray(
        tree, [PERICYTES], setColor, ['cell_2'], 'light',
      );
      expect(Array.from(partial.colorIndices)).toEqual([1]);
    });
  });

  describe('Color indices from raw codes', () => {
    const obsIndex = ['cell_1', 'cell_2', 'cell_3', 'cell_4', 'cell_5'];
    const columns = [
      {
        name: 'Cell Type',
        path: ['Cell Type'],
        codes: Int8Array.from([0, 1, -1, 0, 1]),
        categories: ['T cell', 'B cell'],
      },
      {
        name: 'Leiden',
        path: ['Leiden'],
        codes: Int8Array.from([1, 1, 0, -1, 0]),
        categories: ['0', '1'],
      },
    ];
    const options = [{ name: 'Cell Type' }, { name: 'Leiden' }];
    const codesTree = codesToCellSetsTree({ obsIndex, columns }, options);
    const setColor = [
      { path: ['Cell Type', 'T cell'], color: [255, 0, 0] },
      { path: ['Leiden', '0'], color: [0, 255, 0] },
    ];

    // The two routes must be interchangeable, so compare against the tree route
    // on the tree built from the same columns.
    function expectSameAsTreeRoute(selection) {
      const expected = treeToColorIndicesArray(
        codesTree, selection, setColor, obsIndex, 'light',
      );
      const actual = colorIndicesFromCodes({
        columns, obsIndex, selectedNamePaths: selection, cellSetColor: setColor, theme: 'light',
      });
      expect(actual).not.toEqual(null);
      expect(Array.from(actual.colorIndices)).toEqual(Array.from(expected.colorIndices));
      expect(actual.colors).toEqual(expected.colors);
      expect(actual.colorProbs).toEqual(expected.colorProbs);
    }

    it('matches the tree route for a single-hierarchy selection', () => {
      expectSameAsTreeRoute([['Cell Type', 'T cell'], ['Cell Type', 'B cell']]);
    });

    it('matches the tree route across hierarchies (later path wins)', () => {
      expectSameAsTreeRoute([['Cell Type', 'T cell'], ['Leiden', '1']]);
      expectSameAsTreeRoute([['Leiden', '1'], ['Cell Type', 'T cell']]);
    });

    it('matches the tree route for missing colors and empty selections', () => {
      // 'Leiden' > '1' has no entry in setColor, so it takes the theme default.
      expectSameAsTreeRoute([['Leiden', '1']]);
      expectSameAsTreeRoute([]);
    });

    it('returns null for selections it cannot resolve', () => {
      // A user-defined selection from additionalObsSets.
      expect(colorIndicesFromCodes({
        columns,
        obsIndex,
        selectedNamePaths: [['My Selections', 'Selection 1']],
        cellSetColor: setColor,
        theme: 'light',
      })).toEqual(null);
      // A category that is not in the column.
      expect(colorIndicesFromCodes({
        columns,
        obsIndex,
        selectedNamePaths: [['Cell Type', 'NK cell']],
        cellSetColor: setColor,
        theme: 'light',
      })).toEqual(null);
    });

    it('resolves the placeholder-named set to observations with missing codes', () => {
      // cell_3 has a missing Cell Type code; cell_4 has a missing Leiden code.
      const missing = colorIndicesFromCodes({
        columns,
        obsIndex,
        selectedNamePaths: [['Cell Type', MISSING_VALUE_PLACEHOLDER]],
        cellSetColor: setColor,
        theme: 'light',
      });
      expect(Array.from(missing.colorIndices)).toEqual([0, 0, 1, 0, 0]);
      expectSameAsTreeRoute([['Cell Type', MISSING_VALUE_PLACEHOLDER]]);
      expectSameAsTreeRoute([['Leiden', MISSING_VALUE_PLACEHOLDER], ['Cell Type', 'T cell']]);
      expectSameAsTreeRoute([
        ['Cell Type', MISSING_VALUE_PLACEHOLDER], ['Leiden', MISSING_VALUE_PLACEHOLDER],
      ]);
    });

    it('returns null for a wrong-depth path', () => {
      // A path with the wrong depth.
      expect(colorIndicesFromCodes({
        columns,
        obsIndex,
        selectedNamePaths: [['Cell Type', 'T cell', 'extra']],
        cellSetColor: setColor,
        theme: 'light',
      })).toEqual(null);
    });
  });

  describe('Observation set membership', () => {
    const PERICYTES = ['Cell Type Annotations', 'Vasculature', 'Pericytes'];
    const ENDOTHELIAL = ['Cell Type Annotations', 'Vasculature', 'Endothelial'];
    const SQUAMOUS = ['Cell Type Annotations', 'Vasculature', 'Epithelial', 'Squamous'];

    it('treeToMembershipMap records each leaf set once per observation', () => {
      const membership = treeToMembershipMap(tree);
      // Pericytes and Endothelial are leaves at depth 3, Squamous at depth 4.
      // Leaves shallower than the tree height must not be recorded more than once.
      expect(membership.get('cell_1')).toEqual([PERICYTES]);
      expect(membership.get('cell_3')).toEqual([PERICYTES, ENDOTHELIAL]);
      expect(membership.get('cell_5')).toEqual([ENDOTHELIAL, SQUAMOUS]);
      expect(membership.get('cell_7')).toEqual([SQUAMOUS]);
      expect(membership.size).toEqual(7);
      expect(treeToMembershipMap(null).size).toEqual(0);
    });
  });
});

describe('Missing set names', () => {
  // A negative categorical code is a missing value. codesToCellSetsTree (like
  // dataToCellSetsTree) places those observations in a set named by the placeholder.
  const obsIndex = ['c1', 'c2', 'c3', 'c4'];
  const columns = [{ codes: Int8Array.from([0, -1, 1, -1]), categories: ['A', 'B'] }];
  const missingTree = codesToCellSetsTree({ obsIndex, columns }, [{ name: 'Label' }]);
  const missingPath = ['Label', MISSING_VALUE_PLACEHOLDER];
  const missingNode = missingTree.tree[0].children.find(c => c.name === MISSING_VALUE_PLACEHOLDER);

  it('gives the missing set a real name that survives serialization', () => {
    expect(missingNode).toBeDefined();
    // A selection path into the set round-trips through JSON (as a view config
    // does) and still resolves to the same node.
    const roundTripped = JSON.parse(JSON.stringify(missingPath));
    expect(treeFindNodeByNamePath(missingTree, roundTripped)).toBe(missingNode);
  });

  it('titles the missing set with the shared placeholder in the sets manager', () => {
    const renderProps = nodeToRenderProps(missingNode, missingPath, []);
    expect(renderProps.title).toEqual(MISSING_VALUE_PLACEHOLDER);
    expect(renderProps.size).toEqual(2);
    // Named sets are untouched.
    const namedNode = missingTree.tree[0].children.find(c => c.name === 'A');
    expect(nodeToRenderProps(namedNode, ['Label', 'A'], []).title).toEqual('A');
  });

  it('labels the missing set with the same placeholder in plot data', () => {
    const sizes = treeToSetSizesBySetNames(
      missingTree, [['Label', 'A'], missingPath], [missingPath], [], 'dark',
    );
    expect(sizes.map(s => s.name)).toEqual(['A', MISSING_VALUE_PLACEHOLDER]);
    expect(sizes[1].size).toEqual(2);
    // The identity of the set is still carried by its path, not the display name.
    expect(sizes[1].setNamePath).toEqual(missingPath);

    const objects = treeToObjectsBySetNames(missingTree, [missingPath], [], 'dark');
    expect(objects.map(o => o.obsId)).toEqual(['c2', 'c4']);
    expect(objects.every(o => o.name === MISSING_VALUE_PLACEHOLDER)).toEqual(true);
  });
});

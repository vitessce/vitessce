/* eslint-disable no-control-regex */
import { InternSet, InternMap } from 'internmap';
import {
  treeInitialize,
  nodeAppendChild,
  initializeCellSetColor,
} from '../../components/sets/cell-set-utils';
import {
  SETS_DATATYPE_CELL,
} from '../../components/sets/constants';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';
import LoaderResult from '../LoaderResult';

export function dataToCellSetsTree(data, options) {
  const [cellNames, cellSets] = data;
  const cellSetsTree = treeInitialize(SETS_DATATYPE_CELL);
  cellSets.forEach((cellSetIds, j) => {
    const name = options[j].groupName;
    let levelZeroNode = {
      name,
      children: [],
    };
    if (cellSetIds.length > 0 && Array.isArray(cellSetIds[0])) {
      // Multi-level case.
      let levels = new InternSet([], JSON.stringify);
      cellNames.forEach((id, i) => {
        const classes = cellSetIds.map(col => col[i]);
        levels.add(classes);
      });
      levels = Array(...levels);

      const levelSets = new InternMap([], JSON.stringify);
      levels.forEach((level) => {
        levelSets.set(level, []);
      });

      cellNames.forEach((id, i) => {
        const classes = cellSetIds.map(col => col[i]);
        levelSets.get(classes).push([id, null]);
      });

      // Recursive function to create nodes.
      const getNode = (parentLevelPrefixes, currLevelName, childLevelSuffixes) => {
        const isLeaf = childLevelSuffixes.length === 0;
        const resultNode = {
          name: currLevelName,
        };
        if (isLeaf) {
          // Base case: this is a leaf node.
          resultNode.set = levelSets.get([...parentLevelPrefixes, currLevelName]);
        } else {
          // Are the remaining suffices redundant?
          // Consider ["Parent", "Child", "Child"]
          // where parentLevelPrefixes is ["Parent"] and currLevelName is "Child".
          const shouldBeLeaf = (
            childLevelSuffixes.length === 1
            && currLevelName === childLevelSuffixes[0][childLevelSuffixes[0].length - 1]
          );
          if (shouldBeLeaf) {
            resultNode.set = levelSets.get(
              [...parentLevelPrefixes, currLevelName, ...childLevelSuffixes[0]],
            );
          } else {
            // Recursion, run getNode() on each of the unique names at the next level.
            const nextLevelNames = Array(...new Set(childLevelSuffixes.map(l => l[0])));

            resultNode.children = nextLevelNames
              .map(nextLevelName => getNode(
                [...parentLevelPrefixes, currLevelName],
                nextLevelName,
                childLevelSuffixes
                  .filter(l => l[0] === nextLevelName)
                  .map(l => l.slice(1))
                  .filter(v => v.length > 0),
              ));
          }
        }
        return resultNode;
      };
      // Start the recursion.
      const levelOneNodes = Array(...new Set(levels.map(l => l[0])))
        .map(levelOneName => getNode(
          [],
          levelOneName,
          levels.filter(l => l[0] === levelOneName).map(l => l.slice(1)),
        ));

      levelZeroNode.children = levelOneNodes;
    } else {
      // Single-level case.
      const uniqueCellSetIds = Array(...new Set(cellSetIds)).sort();
      const clusters = {};
      // eslint-disable-next-line no-return-assign
      uniqueCellSetIds.forEach(id => (clusters[id] = { name: id, set: [] }));
      cellSetIds.forEach((id, i) => clusters[id].set.push([cellNames[i], null]));
      Object.values(clusters).forEach(
        // eslint-disable-next-line no-return-assign
        cluster => (levelZeroNode = nodeAppendChild(levelZeroNode, cluster)),
      );
    }
    cellSetsTree.tree.push(levelZeroNode);
  });
  return cellSetsTree;
}

/**
 * Loader for converting zarr into the cell sets json schema.
 */
export default class CellSetsZarrLoader extends AbstractTwoStepLoader {
  loadCellSetIds() {
    const { options } = this;
    const cellSetZarrLocation = options.map(({ setName }) => setName);
    return this.dataSource.loadObsVariables(cellSetZarrLocation);
  }

  async load() {
    if (!this.cellSetsTree) {
      const { options } = this;
      this.cellSetsTree = Promise.all([
        this.dataSource.loadObsIndex(),
        this.loadCellSetIds(),
      ]).then(data => dataToCellSetsTree(data, options));
    }
    const cellSetsTree = await this.cellSetsTree;
    const coordinationValues = {};
    const { tree } = cellSetsTree;
    const newAutoSetSelectionParentName = tree[0].name;
    // Create a list of set paths to initally select.
    const newAutoSetSelections = tree[0].children.map(node => [
      newAutoSetSelectionParentName,
      node.name,
    ]);
    // Create a list of cell set objects with color mappings.
    const newAutoSetColors = initializeCellSetColor(cellSetsTree, []);
    coordinationValues.cellSetSelection = newAutoSetSelections;
    coordinationValues.cellSetColor = newAutoSetColors;
    return Promise.resolve(
      new LoaderResult(cellSetsTree, null, coordinationValues),
    );
  }
}

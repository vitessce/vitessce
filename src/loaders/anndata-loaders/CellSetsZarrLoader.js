/* eslint-disable no-control-regex */
import { InternMap } from 'internmap';
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
  const [cellNames, cellSets, cellSetScores] = data;
  const cellSetsTree = treeInitialize(SETS_DATATYPE_CELL);
  cellSets.forEach((cellSetIds, j) => {
    const name = options[j].groupName;
    let levelZeroNode = {
      name,
      children: [],
    };
    if (cellSetIds.length > 0 && Array.isArray(cellSetIds[0])) {
      // Multi-level case.
      const levelSets = new InternMap([], JSON.stringify);

      cellNames.forEach((id, i) => {
        const classes = cellSetIds.map(col => col[i]);
        if (levelSets.has(classes)) {
          levelSets.get(classes).push([id, null]);
        } else {
          levelSets.set(classes, [[id, null]]);
        }
      });

      const levels = Array.from(levelSets.keys());

      const getNextLevelNames = (levelSuffixes) => {
        const nextLevelNames = Array.from(new Set(levelSuffixes.map(l => l[0])));
        return nextLevelNames.sort((a, b) => a.localeCompare(b));
      };

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
            const nextLevelNames = getNextLevelNames(childLevelSuffixes);

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
      const levelOneNodes = getNextLevelNames(levels)
        .map(levelOneName => getNode(
          [],
          levelOneName,
          levels.filter(l => l[0] === levelOneName).map(l => l.slice(1)),
        ));

      levelZeroNode.children = levelOneNodes;
    } else {
      // Single-level case.
      // Check for the optional corresponding confidence score column name.
      const uniqueCellSetIds = Array.from(new Set(cellSetIds)).sort();
      const clusters = {};
      // eslint-disable-next-line no-return-assign
      uniqueCellSetIds.forEach(id => (clusters[id] = { name: id, set: [] }));
      if (cellSetScores[j]) {
        cellSetIds.forEach((id, i) => clusters[id].set.push([cellNames[i], cellSetScores[j][i]]));
      } else {
        cellSetIds.forEach((id, i) => clusters[id].set.push([cellNames[i], null]));
      }
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

  loadCellSetScores() {
    const { options } = this;
    const cellSetScoreZarrLocation = options.map(option => option.scoreName || undefined);
    return this.dataSource.loadObsVariables(cellSetScoreZarrLocation);
  }

  async load() {
    if (!this.cellSetsTree) {
      const { options } = this;
      this.cellSetsTree = Promise.all([
        this.dataSource.loadObsIndex(),
        this.loadCellSetIds(),
        this.loadCellSetScores(),
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

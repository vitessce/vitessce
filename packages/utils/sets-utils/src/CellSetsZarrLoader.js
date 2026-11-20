import { InternMap } from 'internmap';
import { MISSING_VALUE_PLACEHOLDER } from '@vitessce/utils';
import {
  treeInitialize,
  nodeAppendChild,
} from './cell-set-utils.js';
import {
  SETS_DATATYPE_OBS,
} from './constants.js';

/**
 * Whether a decoded set value is missing. A negative categorical code decodes to
 * categories[-1] === undefined on the string route; other sources may yield null.
 * @param {*} value A decoded set value.
 * @returns {boolean} True when the value is missing.
 */
function isMissing(value) {
  return value === undefined || value === null;
}

/**
 * Name a decoded set value. Missing values share one set named by the shared
 * placeholder, so the name is a real string that survives JSON serialization
 * (an undefined name would be dropped) and that every view renders identically.
 * @param {*} value A decoded set value.
 * @returns {string} The set name.
 */
function toSetName(value) {
  return isMissing(value) ? MISSING_VALUE_PLACEHOLDER : value;
}

/**
 * Build a cell sets tree from raw categorical codes, without materializing one
 * string per observation. Output is identical to what dataToCellSetsTree produces
 * for the equivalent single-level string columns: observed categories only, the
 * same child ordering (via the same plain-object construction), and a set named
 * MISSING_VALUE_PLACEHOLDER, ordered last, for observations with a negative
 * (missing) code.
 * @param {object} params
 * @param {string[]} params.obsIndex The observation index shared by all columns.
 * @param {{ codes: ArrayLike<number>, categories: string[] }[]} params.columns
 * Raw codes and category names, one entry per obsSets option.
 * @param {{ name: string }[]} options The obsSets options, providing hierarchy names.
 * @returns {object} A tree object.
 */
export function codesToCellSetsTree({ obsIndex, columns }, options) {
  const cellSetsTree = treeInitialize(SETS_DATATYPE_OBS);
  columns.forEach(({ codes, categories }, j) => {
    const { name } = options[j];
    let levelZeroNode = {
      name,
      children: [],
    };
    // Determine which categories are observed, since dataToCellSetsTree only
    // creates sets for values that occur in the data.
    const seen = new Uint8Array(categories.length);
    let hasMissing = false;
    for (let i = 0; i < codes.length; i += 1) {
      const code = codes[i];
      if (code >= 0) {
        seen[code] = 1;
      } else {
        hasMissing = true;
      }
    }
    const uniqueCellSetIds = categories.filter((_, k) => seen[k]).sort();
    if (hasMissing) {
      // Observations with a negative (missing) code share one set, named by the
      // placeholder and ordered after every real category, as in dataToCellSetsTree.
      uniqueCellSetIds.push(MISSING_VALUE_PLACEHOLDER);
    }
    const clusters = {};
    // eslint-disable-next-line no-return-assign
    uniqueCellSetIds.forEach(id => (clusters[id] = { name: id, set: [] }));
    // Resolve each observed code to its cluster once, so the per-observation
    // loop is a typed-array read plus a push.
    const clusterByCode = categories.map((cat, k) => (seen[k] ? clusters[cat] : null));
    const missingCluster = hasMissing ? clusters[MISSING_VALUE_PLACEHOLDER] : null;
    for (let i = 0; i < codes.length; i += 1) {
      const code = codes[i];
      const cluster = code >= 0 ? clusterByCode[code] : missingCluster;
      cluster.set.push([obsIndex[i], null]);
    }
    Object.values(clusters).forEach(
      // eslint-disable-next-line no-return-assign
      cluster => (levelZeroNode = nodeAppendChild(levelZeroNode, cluster)),
    );
    cellSetsTree.tree.push(levelZeroNode);
  });
  return cellSetsTree;
}

export function dataToCellSetsTree(data, options) {
  // obsIndex is an array of all cell IDs, for the purposes of set complement operations only.
  // cellNames is per-cellSets arrays of cell IDs.
  const [cellNames, cellSets, cellSetScores] = data;
  const cellSetsTree = treeInitialize(SETS_DATATYPE_OBS);
  cellSets.forEach((cellSetIds, j) => {
    const { name } = options[j];
    let levelZeroNode = {
      name,
      children: [],
    };
    if (cellSetIds.length > 0 && Array.isArray(cellSetIds[0])) {
      // Multi-level case.
      // TODO: throw a warning if the levels are not in order coarser->finer.
      const levelSets = new InternMap([], JSON.stringify);

      cellNames[j].forEach((id, i) => {
        const classes = cellSetIds.map(col => toSetName(col[i]));
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
      // Missing values share one set, named by the placeholder and ordered last.
      const setNames = cellSetIds.map(toSetName);
      const hasMissing = cellSetIds.some(isMissing);
      const uniqueCellSetIds = Array.from(
        new Set(hasMissing ? cellSetIds.filter(id => !isMissing(id)) : cellSetIds),
      ).sort();
      if (hasMissing) {
        uniqueCellSetIds.push(MISSING_VALUE_PLACEHOLDER);
      }
      const clusters = {};
      // eslint-disable-next-line no-return-assign
      uniqueCellSetIds.forEach(id => (clusters[id] = { name: id, set: [] }));
      if (cellSetScores[j]) {
        setNames.forEach((setName, i) => (
          clusters[setName].set.push([cellNames[j][i], cellSetScores[j][i]])
        ));
      } else {
        setNames.forEach((setName, i) => (
          clusters[setName].set.push([cellNames[j][i], null])
        ));
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

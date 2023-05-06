/**
 * Depth-first search of cell set tree, starting from node.
 * @param {*} node The node to start from.
 * @param {*} currentPath The current path.
 * @param {*} paths Accumulated paths so far.
 * @returns all paths from node to leaves.
 */
function getPaths(node, currentPath = [], paths = []) {
  if (node.children) {
    node.children.forEach((child) => {
      const newPath = [...currentPath, child.name];
      paths.push(newPath);
      getPaths(child, newPath, paths);
    });
  }
  return paths;
}

/**
 * Finds either the longest subset or the longest superset of path in
 * arrOfPaths.
 * @param {array} arrOfPaths An array of paths.
 * @param {array} path An array of strings, representing a path.
 * @param {boolean} isSubset A boolean flag that indicates whether we are
 * looking for the longest subset (true) or the longest superset (false).
 * @returns The longest subset or superset of path in arrOfPaths.
*/
const findLongest = (arrOfPaths, path, isSubset) => {
  let longest = null;
  let longestLength = 0;

  arrOfPaths.forEach((subArray) => {
    const matchCount = subArray.filter((v, i) => v === path[i]).length;
    if (
      matchCount === (isSubset ? subArray.length : path.length)
          && subArray.length > longestLength
    ) {
      longest = subArray;
      longestLength = subArray.length;
    }
  });
  if (longestLength > 0) {
    return longest;
  } if (isSubset) {
    return [];
  }
  return false;
};

/**
 * Generates paths by doing DFS of tree and filters out the ones that are irrelevant.
 * Filtering is based on the hierarchy, currently expanded and currently selected cell sets.
 * @param {object} tree The current tree.
 * @param {object} hierarchy The hierarchy object.
 * @param {array} cellSetExpansion An array of cell set paths that are expanded.
 * @param {array} cellSetSelection An array of cell set paths that are selected.
 * @returns An array of paths that should be displayed.
 */
export function generateCellSetPaths(
  mergedCellSets,
  hierarchy,
  cellSetExpansion,
  cellSetSelection,
) {
  const paths = getPaths({ children: mergedCellSets.tree });

  // returns true if path is contained in allPaths, false otherwise
  const contains = (allPaths, path) => allPaths.some(p => p.toString() === path.toString());

  return paths.filter((clusterPath) => {
    // clusterPath is a parent of some selected cell set and is expanded. We should discard it.
    if (contains(cellSetExpansion, clusterPath)) return false;

    // clusterPath is not selected. Now we need to determine if we should keep it.
    if (!contains(cellSetSelection, clusterPath)) {
      /* This line checks if the longest super set of clusterPath in cellSetSelection is longer
            than clusterPath itself. If true, it means clusterPath is a parent of some selected cell
            set but not expanded and we should discard it. */
      if (findLongest(cellSetSelection, clusterPath, false).length > clusterPath.length) {
        return false;
      }

      // the clusterPath is too deep in the tree. We should discard it.
      if (cellSetExpansion.length === 0 && clusterPath.length > 2) return false;

      const longestSubset = findLongest(cellSetExpansion, clusterPath, true);
      // another case of the clusterPath being deep in the tree. We should discard it.
      if (cellSetExpansion.length > 0 && longestSubset.length + 1 < clusterPath.length) {
        return false;
      }
    }
    return clusterPath[0] === hierarchy[0];
  });
}

/**
 * Finds the hierarchy, where cell sets were most recently selected/deselected.
 * @param {array} lastSelection All selected cell sets prior to the modification.
 * @param {array} currentSelection All cell sets that are currently selected.
 * @returns The name of the hierarchy, within which the most recent change occured.
 * If nothing changed, returns 0.
 */
export function findChangedHierarchy(prevSelectedPaths, currSelectedPaths) {
  const arrOfPathsToStr = subarray => subarray.toString();

  const strOfPathsToArr = subarray => subarray.split(',').map((element) => {
    const num = Number(element);
    return num === parseFloat(element) ? num : element;
  });

  const prevPathsStrings = prevSelectedPaths.map(arrOfPathsToStr);
  const currPathsStrings = currSelectedPaths.map(arrOfPathsToStr);

  const unselectedPathsStr = prevPathsStrings.filter(
    pathAsStr => !currPathsStrings.includes(pathAsStr),
  );
  const newlySelectedPathsStr = currPathsStrings.filter(
    pathAsStr => !prevPathsStrings.includes(pathAsStr),
  );

  // nothing was selected or unselected, therefore hierarchy stays the same
  if (unselectedPathsStr.length === 0 && newlySelectedPathsStr.length === 0) {
    return 0;
  }

  /**
   * Picks the first path from newlySelectedPathsStr, if there is one,
   * otherwise from unselectedPathsStr.
   * This is going to be used as the new hierarchy.
   */
  const changedPathStr = newlySelectedPathsStr.length > 0
    ? newlySelectedPathsStr[0] : unselectedPathsStr[0];

  const changedPath = strOfPathsToArr(changedPathStr);

  // we assume that the last element of a path is the leaf node.
  // As leaf nodes do not hold hierarchy information, we can remove it.
  return changedPath.slice(0, -1);
}

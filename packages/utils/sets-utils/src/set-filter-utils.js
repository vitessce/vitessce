import { isEqualOrPrefix } from './utils.js';
import { treeFindNodeByNamePath } from './cell-set-utils.js';

/**
 * Determine whether a set meets the current set-level filtering criteria.
 * A path in the filter includes both the set it points to and all of the
 * descendants of that set.
 * @param {string[][]|null} filterPaths Value of obsSetFilter or sampleSetFilter.
 * A null value means that every set is included.
 * @param {string[]} nodePath The path of the set in question.
 * @returns {boolean} True if the set, and therefore its whole subtree,
 * meets the filtering criteria.
 */
export function isPathFilterIncluded(filterPaths, nodePath) {
  if (!Array.isArray(filterPaths)) {
    return true;
  }
  return filterPaths.some(filterPath => isEqualOrPrefix(filterPath, nodePath));
}

/**
 * Determine whether only part of a set's subtree meets the current set-level
 * filtering criteria, i.e., the set itself is not included but at least one
 * of its descendants is.
 * @param {string[][]|null} filterPaths Value of obsSetFilter or sampleSetFilter.
 * @param {string[]} nodePath The path of the set in question.
 * @returns {boolean} True if the set is partially included.
 */
export function isPathFilterPartiallyIncluded(filterPaths, nodePath) {
  if (!Array.isArray(filterPaths)) {
    return false;
  }
  return !isPathFilterIncluded(filterPaths, nodePath)
    && filterPaths.some(filterPath => isEqualOrPrefix(nodePath, filterPath));
}

/**
 * Determine, for one node, the shortest list of set paths which covers exactly
 * the included sets within that node's subtree. Recursive.
 * @param {object} node A node object.
 * @param {string[]} nodePath The path of the node.
 * @param {string[][]} filterPaths Array of included set paths.
 * @returns {object} `{ isAll, paths }` where `isAll` is true if the node's
 * entire subtree is included, and `paths` is the covering list of paths.
 */
function collectIncludedPaths(node, nodePath, filterPaths) {
  if (isPathFilterIncluded(filterPaths, nodePath)) {
    return { isAll: true, paths: [nodePath] };
  }
  if (!node.children || node.children.length === 0) {
    return { isAll: false, paths: [] };
  }
  const childResults = node.children.map(
    child => collectIncludedPaths(child, [...nodePath, child.name], filterPaths),
  );
  if (childResults.every(childResult => childResult.isAll)) {
    return { isAll: true, paths: [nodePath] };
  }
  return { isAll: false, paths: childResults.flatMap(childResult => childResult.paths) };
}

/**
 * Simplify a list of included set paths, by replacing any complete group of
 * siblings with its parent (recursively) and by dropping any path which is
 * already covered by one of its ancestors.
 * @param {object} mergedSets A merged sets tree object.
 * @param {string[][]|null} filterPaths Value of obsSetFilter or sampleSetFilter.
 * @returns {string[][]|null} The simplified array of set paths, or null if
 * every set in the tree is included, since null is the canonical
 * representation of "no set-level filtering criteria".
 */
export function normalizeFilterPaths(mergedSets, filterPaths) {
  if (!Array.isArray(filterPaths)) {
    return null;
  }
  if (!mergedSets?.tree) {
    // Without the tree, sibling groups cannot be identified,
    // so the paths are returned as-is.
    return filterPaths;
  }
  const results = mergedSets.tree.map(
    lzn => collectIncludedPaths(lzn, [lzn.name], filterPaths),
  );
  if (results.every(result => result.isAll)) {
    return null;
  }
  return results.flatMap(result => result.paths);
}

/**
 * Break an ancestor set path up into the set paths which cover the same sets
 * except for those within the subtree of targetPath. For each level between
 * ancestorPath and targetPath, this is every sibling other than the one on the
 * way down to targetPath.
 * @param {object} mergedSets A merged sets tree object.
 * @param {string[]} ancestorPath The path of an ancestor of targetPath.
 * @param {string[]} targetPath The path of the set to exclude.
 * @returns {string[][]|null} Array of set paths, or null if the tree does not
 * contain the nodes along the way down to targetPath.
 */
function siblingPathsAlongDescent(mergedSets, ancestorPath, targetPath) {
  const result = [];
  // ancestorPath is a prefix of targetPath, so each level on the way down to
  // targetPath is one of its own prefixes.
  for (let i = ancestorPath.length; i < targetPath.length; i += 1) {
    const currPath = targetPath.slice(0, i);
    const currNode = treeFindNodeByNamePath(mergedSets, currPath);
    const nextName = targetPath[i];
    if (!currNode?.children?.some(child => child.name === nextName)) {
      return null;
    }
    currNode.children.forEach((child) => {
      if (child.name !== nextName) {
        result.push([...currPath, child.name]);
      }
    });
  }
  return result;
}

/**
 * Add a set (and its descendants) to the set-level filtering criteria.
 * @param {object} mergedSets A merged sets tree object.
 * @param {string[][]|null} filterPaths Value of obsSetFilter or sampleSetFilter.
 * @param {string[]} targetPath The path of the set to include.
 * @returns {string[][]|null} The next array of included set paths,
 * or null if every set is now included.
 */
export function addPathToFilter(mergedSets, filterPaths, targetPath) {
  if (!Array.isArray(filterPaths)) {
    // Every set is already included.
    return null;
  }
  const nextPaths = [
    // Drop the descendants of targetPath, which it now covers.
    ...filterPaths.filter(filterPath => !isEqualOrPrefix(targetPath, filterPath)),
    targetPath,
  ];
  return normalizeFilterPaths(mergedSets, nextPaths);
}

/**
 * Remove a set (and its descendants) from the set-level filtering criteria.
 * @param {object} mergedSets A merged sets tree object.
 * @param {string[][]|null} filterPaths Value of obsSetFilter or sampleSetFilter.
 * @param {string[]} targetPath The path of the set to exclude.
 * @returns {string[][]} The next array of included set paths.
 */
export function removePathFromFilter(mergedSets, filterPaths, targetPath) {
  const prevPaths = Array.isArray(filterPaths)
    ? filterPaths
    // A null value means that every set is included, so materialize that
    // implicit "everything" as one path per hierarchy before removing.
    : (mergedSets?.tree || []).map(lzn => [lzn.name]);
  const nextPaths = [];
  prevPaths.forEach((prevPath) => {
    if (isEqualOrPrefix(targetPath, prevPath)) {
      // prevPath is targetPath or one of its descendants, so it is excluded.
      return;
    }
    if (isEqualOrPrefix(prevPath, targetPath)) {
      // prevPath is an ancestor of targetPath, so it needs to be replaced by
      // the sibling paths along the way down to targetPath.
      const siblingPaths = siblingPathsAlongDescent(mergedSets, prevPath, targetPath);
      // If the descent could not be resolved, prevPath is kept as-is rather
      // than excluding more sets than the user asked for.
      nextPaths.push(...(siblingPaths === null ? [prevPath] : siblingPaths));
      return;
    }
    nextPaths.push(prevPath);
  });
  // Normalization can only return null when nothing was actually excluded,
  // in which case the un-normalized paths are already correct.
  return normalizeFilterPaths(mergedSets, nextPaths) || nextPaths;
}

/**
 * Restrict a set-level selection to the sets which meet the current set-level
 * filtering criteria. Used to uphold the invariant that the selection must not
 * be a superset of the filter: sets which do not meet the filtering criteria
 * cannot be selected.
 * @param {string[][]|null} filterPaths Value of obsSetFilter or sampleSetFilter.
 * @param {string[][]|null} selectionPaths Value of obsSetSelection
 * or sampleSetSelection.
 * @returns {string[][]|null} The next array of selected set paths,
 * or null if there was no selection to begin with.
 */
export function restrictSelectionToFilter(filterPaths, selectionPaths) {
  if (!Array.isArray(selectionPaths) || !Array.isArray(filterPaths)) {
    return selectionPaths ?? null;
  }
  const nextSelection = selectionPaths.filter(
    selectionPath => isPathFilterIncluded(filterPaths, selectionPath),
  );
  // Return the previous array when nothing changed, to avoid
  // needless coordination value updates.
  return nextSelection.length === selectionPaths.length ? selectionPaths : nextSelection;
}

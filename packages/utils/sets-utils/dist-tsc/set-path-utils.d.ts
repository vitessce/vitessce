/**
 * Returns a path that belongs to cellSetSelection and is the longest path
 * found in at least one of the paths in arrOfPaths.
 * @param {array of paths} arrOfPaths contains all paths we are interested in
 * @param {array of paths} cellSetSelection contains the paths of the selected cell sets
 * @returns
 */
export function findLongestCommonPath(arrOfPaths: any, cellSetSelection: any): any[];
/**
 * Generates paths by doing DFS of tree and filters out the ones that are irrelevant.
 * Filtering is based on the hierarchy, currently expanded and currently selected cell sets.
 * @param {object} tree The current tree.
 * @param {string[]} hierarchy Array of level-zero set names, like
 * `['Louvain Clustering']`.
 * @param {array} cellSetExpansion An array of cell set paths that are expanded.
 * @param {array} cellSetSelection An array of cell set paths that are selected.
 * @returns An array of paths that should be displayed.
 */
export function filterPathsByExpansionAndSelection(mergedCellSets: any, hierarchy: string[], cellSetExpansion: array, cellSetSelection: array): any;
/**
 * Finds the hierarchy, where cell sets were most recently selected/deselected.
 * @param {array} lastSelection All selected cell sets prior to the modification.
 * @param {array} currentSelection All cell sets that are currently selected.
 * @returns The name of the hierarchy, within which the most recent change occured.
 * If nothing changed, returns 0.
 */
export function findChangedHierarchy(prevSelectedPaths: any, currSelectedPaths: any): any;
//# sourceMappingURL=set-path-utils.d.ts.map
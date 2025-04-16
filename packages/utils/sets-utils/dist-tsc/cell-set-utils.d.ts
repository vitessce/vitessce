/**
 * Get the set associated with a particular node.
 * Recursive.
 * @param {object} currNode A node object.
 * @returns {array} The array representing the set associated with the node.
 */
export function nodeToSet(currNode: object): array;
/**
 * Get the height of a node (the number of levels to reach a leaf).
 * @param {object} currNode A node object.
 * @param {number} level The level that the height will be computed relative to. By default, 0.
 * @returns {number} The height. If the node has a .children property,
 * then the minimum value returned is 1.
 */
export function nodeToHeight(currNode: object, level?: number): number;
/**
 * Get the size associated with a particular node.
 * Recursive.
 * @param {object} currNode A node object.
 * @returns {number} The length of all the node's children
 */
export function getNodeLength(currNode: object): number;
/**
 * Find a node with a matching name path, relative to the whole tree.
 * @param {object} currTree A tree object.
 * @param {string[]} targetNamePath The name path for the node of interest.
 * @returns {object|null} A matching node object, or null if none is found.
 */
export function treeFindNodeByNamePath(currTree: object, targetNamePath: string[]): object | null;
/**
 * Transform a node object using a transform function.
 * @param {object} node A node object.
 * @param {function} predicate Returns true if a node matches a condition of interest.
 * @param {function} transform Takes the node matching the predicate as input, returns
 * a transformed version of the node.
 * @param {array} transformedPaths This array parameter is mutated. The path of
 * each transformed node is appended to this array.
 * @param {string[]} The current path of the node being updated, used internally
 * during recursion.
 * @returns {object} The updated node.
 */
export function nodeTransform(node: object, predicate: Function, transform: Function, transformedPaths: array, currPath: any): object;
/**
 * Transform many node objects using a transform function.
 * @param {object} node A node object.
 * @param {function} predicate Returns true if a node matches a condition of interest.
 * @param {function} transform Takes the node matching the predicate as input, returns
 * a transformed version of the node.
 * @param {array} transformedPaths This array parameter is mutated. The path of
 * each transformed node is appended to this array.
 * @param {string[]} The current path of the node being updated, used internally
 * during recursion.
 * @returns {object} The updated node.
 */
export function nodeTransformAll(node: object, predicate: Function, transform: Function, transformedPaths: array, currPath: any): object;
/**
 * Append a child to a parent node.
 * @param {object} currNode A node object.
 * @param {object} newChild The child node object.
 * @returns {object} The updated node.
 */
export function nodeAppendChild(currNode: object, newChild: object): object;
/**
 * Prepend a child to a parent node.
 * @param {object} currNode A node object.
 * @param {object} newChild The child node object.
 * @returns {object} The updated node.
 */
export function nodePrependChild(currNode: object, newChild: object): object;
/**
 * Insert a child to a parent node.
 * @param {object} currNode A node object.
 * @param {*} newChild The child node object.
 * @param {*} insertIndex The index at which to insert the child.
 * @returns {object} The updated node.
 */
export function nodeInsertChild(currNode: object, newChild: any, insertIndex: any): object;
/**
 * Get an array representing the union of the sets of checked nodes.
 * @param {object} currTree A tree object.
 * @returns {array} An array representing the union of the sets of checked nodes.
 */
export function treeToUnion(currTree: object, checkedPaths: any): array;
/**
 * Get an array representing the intersection of the sets of checked nodes.
 * @param {object} currTree A tree object.
 * @returns {array} An array representing the intersection of the sets of checked nodes.
 */
export function treeToIntersection(currTree: object, checkedPaths: any): array;
/**
 * Get an array representing the complement of the union of the sets of checked nodes.
 * @param {object} currTree
 * @returns {array} An array representing the complement of the
 * union of the sets of checked nodes.
 */
export function treeToComplement(currTree: object, checkedPaths: any, items: any): array;
/**
 * Get an flattened array of descendants at a particular relative
 * level of interest.
 * @param {object} node A node object.
 * @param {number} level The relative level of interest.
 * 0 for this node's children, 1 for grandchildren, etc.
 * @param {boolean} stopEarly Should a node be returned early if no children exist?
 * @returns {object[]} An array of descendants at the specified level,
 * where the level is relative to the node.
 */
export function nodeToLevelDescendantNamePaths(node: object, level: number, prevPath: any, stopEarly?: boolean): object[];
/**
 * Export the tree by clearing tree state and all node states.
 * @param {object} currTree A tree object.
 * @returns {object} Tree object with tree and node state removed.
 */
export function treeExport(currTree: object, datatype: any): object;
/**
 * Export the tree by clearing tree state and all node states,
 * and filter so that only the level zero node of interest is included.
 * @param {object} currTree A tree object.
 * @param {string} nodePath The path of the node of interest.
 * @param {string} dataType Datatype (i.e cell sets)
 * @param {Array} cellSetColors Array of objects of cell set colors and paths
 * @param {string} theme "light" or "dark" for the vitessce theme
 * @returns {object} { treeToExport, nodeName }
 * Tree with one level zero node, and with state removed.
 */
export function treeExportLevelZeroNode(currTree: object, nodePath: string, datatype: any, cellSetColors: any[], theme: string): object;
/**
 * Prepare the set of a node of interest for export.
 * @param {object} currTree A tree object.
 * @param {string} nodeKey The key of the node of interest.
 * @returns {object} { setToExport, nodeName } The set as an array.
 */
export function treeExportSet(currTree: object, nodePath: any): object;
/**
 * Get an empty tree, with a default tree state.
 * @param {string} datatype The type of sets that this tree contains.
 * @returns {object} Empty tree.
 */
export function treeInitialize(datatype: string): object;
/**
 * For convenience, get an object with information required
 * to render a node as a component.
 * @param {object} node A node to be rendered.
 * @returns {object} An object containing properties required
 * by the TreeNode render functions.
 */
export function nodeToRenderProps(node: object, path: any, cellSetColor: any): object;
/**
 * Given a tree with state, get the cellIds and cellColors,
 * based on the nodes currently marked as "visible".
 * @param {object} currTree A tree object.
 *  @param {array} selectedNamePaths Array of arrays of strings,
 * representing set "paths".
 * @param {object[]} cellSetColor Array of objects with the
 * properties `path` and `color`.
 * @param {string} theme "light" or "dark" for the vitessce theme
 * @returns {array} Tuple of [cellIds, cellColors]
 * where cellIds is an array of strings,
 * and cellColors is an object mapping cellIds to color [r,g,b] arrays.
 */
export function treeToCellColorsBySetNames(currTree: object, selectedNamePaths: array, cellSetColor: object[], theme: string): array;
/**
 * Given a tree with state, get a mapping from cell ID to cell set color index,
 * based on the nodes currently marked as "visible".
 * @param {object} currTree A tree object.
 *  @param {array} selectedNamePaths Array of arrays of strings,
 * representing set "paths".
 * @param {object[]} cellSetColor Array of objects with the
 * properties `path` and `color`.
 * @returns {array} Tuple of [cellIds, cellColors]
 * where cellIds is an array of strings,
 * and cellColors is an object mapping cellIds to color [r,g,b] arrays.
 */
export function treeToCellSetColorIndicesBySetNames(currTree: object, selectedNamePaths: array, cellSetColor: object[]): array;
/**
 * Given a tree with state, get an array of
 * objects with cellIds and cellColors,
 * based on the nodes currently marked as "visible".
 * @param {object} currTree A tree object.
 * @param {array} selectedNamePaths Array of arrays of strings,
 * representing set "paths".
 * @param {object[]} setColor Array of objects with the
 * properties `path` and `color`
 * @param {string} theme "light" or "dark" for the vitessce theme.
 * @returns {object[]} Array of objects with properties
 * `obsId`, `name`, and `color`.
 */
export function treeToObjectsBySetNames(currTree: object, selectedNamePaths: array, setColor: object[], theme: string): object[];
export function treeToCellPolygonsBySetNames(currTree: any, obsIndex: any, obsEmbedding: any, selectedNamePaths: any, cellSetColor: any, theme: any): any[];
/**
 * Given a tree with state, get the sizes of the
 * sets currently marked as "visible".
 * @param {object} currTree A tree object.
 * @param {array} allNamePaths Array of all paths.
 * @param {array} selectedNamePaths Array of arrays of strings,
 * representing selected paths.
 * @param {object[]} setColor Array of objects with the
 * properties `path` and `color`.
 * @param {string} theme "light" or "dark" for the vitessce theme
 * @returns {object[]} Array of objects
 * with the properties `name`, `size`, `key`,
 * and `color`.
 */
export function treeToSetSizesBySetNames(currTree: object, allNamePaths: array, selectedNamePaths: array, setColor: object[], theme: string): object[];
/**
 * Find and remove a node from the descendants of the current node.
 * @param {object} node A node to search on.
 * @param {array} prevPath Path of the current node to be searched.
 * @param {array} filterPath The path sought.
 * @returns {object} A new node without a node at filterPath.
 */
export function filterNode(node: object, prevPath: array, filterPath: array): object;
export function treeToExpectedCheckedLevel(currTree: any, checkedPaths: any): null;
export function treesConflict(cellSets: any, testCellSets: any): boolean;
export function initializeCellSetColor(cellSets: any, cellSetColor: any): any[];
export function getCellSetPolygons(params: any): any[];
export function treeToMembershipMap(currTree: any): Map<any, any>;
//# sourceMappingURL=cell-set-utils.d.ts.map
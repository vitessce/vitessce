/* eslint-disable no-underscore-dangle */
import { v4 as uuidv4 } from 'uuid';
import { isNil, isEqual, range } from 'lodash-es';
import { featureCollection as turfFeatureCollection, point as turfPoint } from '@turf/helpers';
import { centroid } from '@turf/centroid';
import concaveman from 'concaveman';
import { getDefaultColor, PALETTE, MISSING_VALUE_PLACEHOLDER } from '@vitessce/utils';
import {
  HIERARCHICAL_SCHEMAS,
} from './constants.js';
import { pathToKey } from './utils.js';

/**
 * Alias for the uuidv4 function to make code more readable.
 * @returns {string} UUID.
 */
function generateKey() {
  return uuidv4();
}

/**
 * Get the set associated with a particular node.
 * Recursive.
 * @param {object} currNode A node object.
 * @returns {array} The array representing the set associated with the node.
 */
export function nodeToSet(currNode) {
  if (!currNode) {
    return [];
  }
  if (!currNode.children) {
    return (currNode.set || []);
  }
  return currNode.children.flatMap(c => nodeToSet(c));
}

/**
 * Get the height of a node (the number of levels to reach a leaf).
 * @param {object} currNode A node object.
 * @param {number} level The level that the height will be computed relative to. By default, 0.
 * @returns {number} The height. If the node has a .children property,
 * then the minimum value returned is 1.
 */
export function nodeToHeight(currNode, level = 0) {
  if (!currNode.children) {
    return level;
  }
  const newLevel = level + 1;
  const childrenHeights = currNode.children.map(c => nodeToHeight(c, newLevel));
  return Math.max(...childrenHeights, newLevel);
}

/**
 * Get the size associated with a particular node.
 * Recursive.
 * @param {object} currNode A node object.
 * @returns {number} The length of all the node's children
 */
export function getNodeLength(currNode) {
  if (!currNode) {
    return 0;
  }
  if (!currNode.children) {
    return (currNode.set?.length || 0);
  }
  return currNode.children.reduce((acc, curr) => acc + getNodeLength(curr), 0);
}

/**
 * Find a node with a matching name path, relative to a particular node.
 * @param {object} node A node object.
 * @param {string[]} path The name path for the node of interest.
 * @param {number} currLevelIndex The index of the current hierarchy level.
 * @returns {object|null} A matching node object, or null if none is found.
 */
function nodeFindNodeByNamePath(node, path, currLevelIndex) {
  const currNodeName = path[currLevelIndex];
  if (node.name === currNodeName) {
    if (currLevelIndex === path.length - 1) {
      return node;
    }
    if (node.children) {
      const foundNodes = node.children
        .map(child => nodeFindNodeByNamePath(child, path, currLevelIndex + 1))
        .filter(Boolean);
      if (foundNodes.length === 1) {
        return foundNodes[0];
      }
    }
  }
  return null;
}

/**
 * Find a node with a matching name path, relative to the whole tree.
 * @param {object} currTree A tree object.
 * @param {string[]} targetNamePath The name path for the node of interest.
 * @returns {object|null} A matching node object, or null if none is found.
 */
export function treeFindNodeByNamePath(currTree, targetNamePath) {
  const foundNodes = currTree.tree
    .map(levelZeroNode => nodeFindNodeByNamePath(levelZeroNode, targetNamePath, 0))
    .filter(Boolean);
  if (foundNodes.length === 1) {
    return foundNodes[0];
  }
  return null;
}

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
export function nodeTransform(node, predicate, transform, transformedPaths, currPath) {
  let newPath;
  if (!currPath) {
    newPath = [node.name];
  } else {
    newPath = [...currPath];
  }
  if (predicate(node, newPath)) {
    transformedPaths.push(newPath);
    return transform(node, newPath);
  }
  if (node.children) {
    return {
      ...node,
      children: node.children.map(
        child => nodeTransform(
          child, predicate, transform, transformedPaths, newPath.concat([child.name]),
        ),
      ),
    };
  }
  return node;
}

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
export function nodeTransformAll(node, predicate, transform, transformedPaths, currPath) {
  let newPath;
  if (!currPath) {
    newPath = [node.name];
  } else {
    newPath = [...currPath];
  }
  let newNode = node;
  if (predicate(node, newPath)) {
    transformedPaths.push(newPath);
    newNode = transform(node, newPath);
  }
  if (node.children) {
    return {
      ...newNode,
      children: newNode.children.map(
        child => nodeTransformAll(
          child, predicate, transform, transformedPaths, newPath.concat([child.name]),
        ),
      ),
    };
  }
  return newNode;
}

/**
 * Append a child to a parent node.
 * @param {object} currNode A node object.
 * @param {object} newChild The child node object.
 * @returns {object} The updated node.
 */
export function nodeAppendChild(currNode, newChild) {
  return {
    ...currNode,
    children: [...currNode.children, newChild],
  };
}

/**
 * Prepend a child to a parent node.
 * @param {object} currNode A node object.
 * @param {object} newChild The child node object.
 * @returns {object} The updated node.
 */
export function nodePrependChild(currNode, newChild) {
  return {
    ...currNode,
    children: [newChild, ...currNode.children],
  };
}

/**
 * Insert a child to a parent node.
 * @param {object} currNode A node object.
 * @param {*} newChild The child node object.
 * @param {*} insertIndex The index at which to insert the child.
 * @returns {object} The updated node.
 */
export function nodeInsertChild(currNode, newChild, insertIndex) {
  const newChildren = Array.from(currNode.children);
  newChildren.splice(insertIndex, 0, newChild);
  return {
    ...currNode,
    children: newChildren,
  };
}

/**
 * Get an array representing the union of the sets of checked nodes.
 * @param {object} currTree A tree object.
 * @returns {array} An array representing the union of the sets of checked nodes.
 */
export function treeToUnion(currTree, checkedPaths) {
  const nodes = checkedPaths.map(path => treeFindNodeByNamePath(currTree, path));
  const nodeSets = nodes.map(node => nodeToSet(node).map(([cellId]) => cellId));
  return nodeSets
    .reduce((a, h) => a.concat(h.filter(hEl => !a.includes(hEl))), nodeSets[0] || []);
}

/**
 * Get an array representing the intersection of the sets of checked nodes.
 * @param {object} currTree A tree object.
 * @returns {array} An array representing the intersection of the sets of checked nodes.
 */
export function treeToIntersection(currTree, checkedPaths) {
  const nodes = checkedPaths.map(path => treeFindNodeByNamePath(currTree, path));
  const nodeSets = nodes.map(node => nodeToSet(node).map(([cellId]) => cellId));
  return nodeSets
    .reduce((a, h) => h.filter(hEl => a.includes(hEl)), nodeSets[0] || []);
}

/**
 * Get an array representing the complement of the union of the sets of checked nodes.
 * @param {object} currTree
 * @returns {array} An array representing the complement of the
 * union of the sets of checked nodes.
 */
export function treeToComplement(currTree, checkedPaths, items) {
  const primaryUnion = treeToUnion(currTree, checkedPaths);
  return items.filter(el => !primaryUnion.includes(el));
}

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
export function nodeToLevelDescendantNamePaths(node, level, prevPath, stopEarly = false) {
  if (!node.children) {
    if (!stopEarly) {
      return null;
    }
    return [[...prevPath, node.name]];
  }
  if (level === 0) {
    return [[...prevPath, node.name]];
  }
  return node.children
    .flatMap(c => nodeToLevelDescendantNamePaths(c, level - 1, [...prevPath, node.name], stopEarly))
    .filter(Boolean);
}

/**
 * Export the tree by clearing tree state and all node states.
 * @param {object} currTree A tree object.
 * @returns {object} Tree object with tree and node state removed.
 */
export function treeExport(currTree, datatype) {
  return {
    version: HIERARCHICAL_SCHEMAS.latestVersion,
    datatype,
    tree: currTree.tree,
  };
}

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
export function treeExportLevelZeroNode(currTree, nodePath, datatype, cellSetColors, theme) {
  const node = treeFindNodeByNamePath(currTree, nodePath);
  const nodeWithColors = nodeTransformAll(node, () => true, (n, nPath) => {
    const nodeColor = cellSetColors?.find(c => isEqual(c.path, nPath))?.color
      ?? getDefaultColor(theme);
    return {
      ...n,
      color: nodeColor.slice(0, 3),
    };
  }, []);
  const treeWithOneLevelZeroNode = {
    ...currTree,
    tree: [nodeWithColors],
  };
  return {
    treeToExport: treeExport(treeWithOneLevelZeroNode, datatype),
    nodeName: node.name,
  };
}

/**
 * Prepare the set of a node of interest for export.
 * @param {object} currTree A tree object.
 * @param {string} nodeKey The key of the node of interest.
 * @returns {object} { setToExport, nodeName } The set as an array.
 */
export function treeExportSet(currTree, nodePath) {
  const node = treeFindNodeByNamePath(currTree, nodePath);
  return { setToExport: nodeToSet(node), nodeName: node.name };
}

/**
 * Get an empty tree, with a default tree state.
 * @param {string} datatype The type of sets that this tree contains.
 * @returns {object} Empty tree.
 */
export function treeInitialize(datatype) {
  return {
    version: HIERARCHICAL_SCHEMAS.latestVersion,
    datatype,
    tree: [],
  };
}

/**
 * For convenience, get an object with information required
 * to render a node as a component.
 * @param {object} node A node to be rendered.
 * @returns {object} An object containing properties required
 * by the TreeNode render functions.
 */
export function nodeToRenderProps(node, path, cellSetColor) {
  const level = path.length - 1;
  return {
    title: node.name ?? MISSING_VALUE_PLACEHOLDER,
    nodeKey: pathToKey(path),
    path,
    size: getNodeLength(node),
    color: cellSetColor?.find(d => isEqual(d.path, path))?.color,
    level,
    isLeaf: (!node.children || node.children.length === 0) && Boolean(node.set),
    height: nodeToHeight(node),
  };
}

/**
 * Using a color and a probability, mix the color with an "uncertainty" color,
 * for example, gray.
 * Reference: https://github.com/bgrins/TinyColor/blob/80f7225029c428c0de0757f7d98ac15f497bee57/tinycolor.js#L701
 * @param {number[]} originalColor The color assignment for the class.
 * @param {number} p The mixing amount, or level certainty in the originalColor classification,
 * between 0 and 1.
 * @param {number[]} mixingColor The color with which to mix. By default, [128, 128, 128] gray.
 * @returns {number[]} Returns the color after mixing.
 */
function colorMixWithUncertainty(originalColor, p, mixingColor = [128, 128, 128]) {
  return [
    ((originalColor[0] - mixingColor[0]) * p) + mixingColor[0],
    ((originalColor[1] - mixingColor[1]) * p) + mixingColor[1],
    ((originalColor[2] - mixingColor[2]) * p) + mixingColor[2],
  ];
}

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
export function treeToCellColorsBySetNames(currTree, selectedNamePaths, cellSetColor, theme) {
  // Insert into the Map directly rather than accumulating an intermediate array of
  // [cellId, color] tuples. Spreading the accumulator once per selected set is
  // O(numObservations * numSelectedSets); this is O(numObservations).
  const cellColors = new Map();
  selectedNamePaths.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      const nodeColor = (
        cellSetColor?.find(d => isEqual(d.path, setNamePath))?.color
        || getDefaultColor(theme)
      );
      nodeSet.forEach(([cellId, prob]) => {
        cellColors.set(
          cellId,
          (isNil(prob) ? nodeColor : colorMixWithUncertainty(nodeColor, prob)),
        );
      });
    }
  });
  return cellColors;
}

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
export function treeToSelectedSetMap(currTree, selectedNamePaths) {
  const result = new Map();
  selectedNamePaths.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      nodeSet.forEach(([cellId]) => {
        result.set(
          cellId,
          // TODO: should this be the full path
          // (rather than only the node name)?
          // Or the index of the selected set
          // with respect to the selectedNamePaths array?
          setNamePath,
        );
      });
    }
  });
  return result;
}

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
export function treeToCellSetColorIndicesBySetNames(currTree, selectedNamePaths, cellSetColor) {
  const cellColorIndices = new Map();
  selectedNamePaths?.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      const nodeColorIndex = cellSetColor?.findIndex(d => isEqual(d.path, setNamePath));
      nodeSet.forEach(([cellId]) => {
        cellColorIndices.set(cellId, nodeColorIndex);
      });
    }
  });
  return cellColorIndices;
}

// Cache of observation-ID-to-position lookups, keyed weakly by the obsIndex array
// itself. Loaders memoize obsIndex per store path, so views that share an
// observation axis share the one Map rather than each building their own.
const obsIndexMapCache = new WeakMap();

/**
 * Get a mapping from observation ID to its position in obsIndex, memoized on the
 * obsIndex array reference.
 * @param {string[]} obsIndex The observation index.
 * @returns {Map<string, number>} Mapping from observation ID to integer position.
 */
export function getObsIndexMap(obsIndex) {
  let obsIndexMap = obsIndexMapCache.get(obsIndex);
  if (!obsIndexMap) {
    obsIndexMap = new Map();
    for (let i = 0; i < obsIndex.length; i += 1) {
      obsIndexMap.set(obsIndex[i], i);
    }
    obsIndexMapCache.set(obsIndex, obsIndexMap);
  }
  return obsIndexMap;
}

/**
 * Build a positionally-indexed color encoding for a set selection.
 *
 * Unlike treeToCellColorsBySetNames, the result is aligned to obsIndex by position
 * rather than keyed by observation ID, so consumers index into it with the same
 * integer they already use to read coordinates. That avoids both a per-observation
 * string hash lookup on every render and the per-observation color array that
 * uncertainty mixing would otherwise allocate.
 *
 * @param {object} currTree A tree object.
 * @param {array} selectedNamePaths Array of arrays of strings, representing set "paths".
 * @param {object[]} cellSetColor Array of objects with the properties `path` and `color`.
 * @param {string[]} obsIndex The observation index to align the result to.
 * @param {string} theme "light" or "dark" for the vitessce theme.
 * @returns {object} An object `{ colorIndices, colorProbs, colors }` where
 * `colorIndices` is a typed array parallel to obsIndex, holding 0 for observations
 * in no selected set and `i + 1` for those in `selectedNamePaths[i]`;
 * `colors` holds the [r, g, b] color per selected set;
 * and `colorProbs` is a Float32Array of per-observation confidence scores, or null
 * when no selected set carries them.
 */
/**
 * Build the positional color encoding directly from raw categorical codes,
 * skipping the tree walk that treeToColorIndicesArray performs. Applicable when
 * every selected path resolves to a (hierarchy, category) pair in the provided
 * columns, where the category MISSING_VALUE_PLACEHOLDER resolves to the
 * observations with a negative (missing) code. Selections that do not resolve —
 * user-defined selections from additionalObsSets, or paths deeper than two
 * levels — return null so the caller can fall back to the tree route.
 *
 * The output is identical to treeToColorIndicesArray for the tree built from the
 * same columns: index 0 means "in no selected set", and where an observation is
 * in multiple selected sets (across hierarchies), the later path wins.
 *
 * @param {object} params
 * @param {{ path: string[], codes: ArrayLike<number>,
 *   categories: string[] }[]} params.columns Raw codes per hierarchy; path is the
 * hierarchy's path in the tree, e.g. ['Cell Type Annotations'].
 * @param {string[]} params.obsIndex The observation index the columns align to.
 * @param {array} params.selectedNamePaths Array of selected set "paths".
 * @param {object[]} params.cellSetColor Array of objects with `path` and `color`.
 * @param {string} params.theme "light" or "dark" for the vitessce theme.
 * @returns {object|null} `{ colorIndices, colorProbs, colors }` as in
 * treeToColorIndicesArray (colorProbs always null: the codes route carries no
 * per-observation scores), or null when a selected path does not resolve.
 */
/**
 * The smallest unsigned typed array able to index `count` selected sets, with 0
 * reserved for "in no selected set".
 * @param {number} count Number of selected sets.
 * @returns {Uint8ArrayConstructor|Uint16ArrayConstructor|Uint32ArrayConstructor}
 */
function getIndicesArrayType(count) {
  if (count + 1 <= 256) {
    return Uint8Array;
  }
  return count + 1 <= 65536 ? Uint16Array : Uint32Array;
}

/**
 * Positional membership for a set selection: element i is 1 + the position in
 * selectedNamePaths of the selected set containing observation i, or 0 when it
 * is in none. Where an observation is in several selected sets, the later path
 * wins, matching treeToSelectedSetMap and treeToColorIndicesArray. The
 * observation index map is only built once a selected path resolves to a node.
 * @param {object} currTree A tree object.
 * @param {array} selectedNamePaths Array of selected set "paths".
 * @param {string[]} obsIndex The observation index to align to.
 * @returns {Uint8Array|Uint16Array|Uint32Array} One entry per observation.
 */
export function treeToSetIndicesArray(currTree, selectedNamePaths, obsIndex) {
  const numObs = obsIndex?.length || 0;
  const paths = selectedNamePaths || [];
  const IndicesArrayType = getIndicesArrayType(paths.length);
  const indices = new IndicesArrayType(numObs);
  let obsIndexMap = null;
  paths.forEach((setNamePath, i) => {
    const node = numObs > 0 && currTree
      ? treeFindNodeByNamePath(currTree, setNamePath)
      : null;
    if (node) {
      if (obsIndexMap === null) {
        obsIndexMap = getObsIndexMap(obsIndex);
      }
      nodeToSet(node).forEach(([cellId]) => {
        const obsI = obsIndexMap.get(cellId);
        if (obsI !== undefined) {
          indices[obsI] = i + 1;
        }
      });
    }
  });
  return indices;
}

/**
 * The same positional membership as treeToSetIndicesArray, computed from raw
 * categorical codes without touching the tree: one typed-array read per
 * observation per hierarchy. The category MISSING_VALUE_PLACEHOLDER resolves to
 * observations with a negative (missing) code.
 * @param {object} params
 * @param {{ path: string[], codes: ArrayLike<number>,
 *   categories: string[] }[]} params.columns Raw codes per hierarchy.
 * @param {string[]} params.obsIndex The observation index the columns align to.
 * @param {array} params.selectedNamePaths Array of selected set "paths".
 * @returns {Uint8Array|Uint16Array|Uint32Array|null} One entry per observation,
 * or null when a selected path does not resolve (a user-defined selection, a path
 * deeper than two levels, or an unknown category) so the caller can use the tree.
 */
export function setIndicesFromCodes({ columns, obsIndex, selectedNamePaths }) {
  const numObs = obsIndex?.length || 0;
  const paths = selectedNamePaths || [];
  // Per column, a map from category code to (selected path index + 1). Later
  // selected paths overwrite earlier ones within a column; across columns, the
  // max index per observation reproduces the same later-path-wins rule.
  const selIdxByCode = columns.map(
    ({ categories }) => new Int32Array(categories.length),
  );
  // Per column, the (selected path index + 1) for observations with a negative
  // (missing) code, when the placeholder-named set is selected.
  const selIdxMissing = new Int32Array(columns.length);
  for (let i = 0; i < paths.length; i += 1) {
    const setNamePath = paths[i];
    const colIndex = columns.findIndex(({ path }) => (
      path.length === setNamePath.length - 1
      && path.every((part, k) => part === setNamePath[k])
    ));
    if (colIndex === -1) {
      return null;
    }
    const category = setNamePath[setNamePath.length - 1];
    const catIndex = columns[colIndex].categories.indexOf(category);
    if (category === MISSING_VALUE_PLACEHOLDER) {
      // The set of observations whose code is negative. Should a real category
      // share the placeholder name, the tree merges both into one set, so both
      // are included here as well.
      selIdxMissing[colIndex] = i + 1;
    } else if (catIndex === -1) {
      return null;
    }
    if (catIndex !== -1) {
      selIdxByCode[colIndex][catIndex] = i + 1;
    }
  }
  const IndicesArrayType = getIndicesArrayType(paths.length);
  const indices = new IndicesArrayType(numObs);
  for (let j = 0; j < columns.length; j += 1) {
    const { codes } = columns[j];
    const table = selIdxByCode[j];
    const missingSel = selIdxMissing[j];
    for (let i = 0; i < numObs; i += 1) {
      const code = codes[i];
      const v = code >= 0 ? table[code] : missingSel;
      if (v > indices[i]) {
        indices[i] = v;
      }
    }
  }
  return indices;
}

export function colorIndicesFromCodes({
  columns, obsIndex, selectedNamePaths, cellSetColor, theme,
}) {
  const colorIndices = setIndicesFromCodes({ columns, obsIndex, selectedNamePaths });
  if (colorIndices === null) {
    return null;
  }
  const colors = (selectedNamePaths || []).map(setNamePath => (
    cellSetColor?.find(d => isEqual(d.path, setNamePath))?.color
    || getDefaultColor(theme)
  ));
  return { colorIndices, colorProbs: null, colors };
}

export function treeToColorIndicesArray(
  currTree, selectedNamePaths, cellSetColor, obsIndex, theme,
) {
  const numObs = obsIndex?.length || 0;
  const paths = selectedNamePaths || [];
  // Reserve 0 for "in no selected set", so the palette needs paths.length + 1 values.
  const IndicesArrayType = getIndicesArrayType(paths.length);
  const colorIndices = new IndicesArrayType(numObs);
  const colors = [];
  // Allocated lazily: most set hierarchies carry no confidence scores, and skipping
  // the array entirely lets consumers take a cheaper code path.
  let colorProbs = null;

  // Built for every selected path, including paths absent from the tree, so that
  // colors[colorIndices[i] - 1] stays aligned with selectedNamePaths. The
  // observation index map is only built once a selected path resolves to a node,
  // so an empty selection costs nothing beyond the (zeroed) indices array.
  let obsIndexMap = null;
  paths.forEach((setNamePath, i) => {
    colors.push(
      cellSetColor?.find(d => isEqual(d.path, setNamePath))?.color
      || getDefaultColor(theme),
    );
    const node = numObs > 0 && currTree
      ? treeFindNodeByNamePath(currTree, setNamePath)
      : null;
    if (node) {
      if (obsIndexMap === null) {
        obsIndexMap = getObsIndexMap(obsIndex);
      }
      const nodeSet = nodeToSet(node);
      nodeSet.forEach(([cellId, prob]) => {
        const obsI = obsIndexMap.get(cellId);
        if (obsI !== undefined) {
          // Later paths overwrite earlier ones, matching treeToCellColorsBySetNames.
          colorIndices[obsI] = i + 1;
          if (!isNil(prob)) {
            if (colorProbs === null) {
              colorProbs = new Float32Array(numObs).fill(1);
            }
            colorProbs[obsI] = prob;
          } else if (colorProbs !== null) {
            colorProbs[obsI] = 1;
          }
        }
      });
    }
  });
  return { colorIndices, colorProbs, colors };
}

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
export function treeToObjectsBySetNames(currTree, selectedNamePaths, setColor, theme) {
  const cellsArray = [];
  for (let i = 0; i < selectedNamePaths.length; i += 1) {
    const setNamePath = selectedNamePaths[i];
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      const nodeColor = (
        setColor?.find(d => isEqual(d.path, setNamePath))?.color
        || getDefaultColor(theme)
      );
      nodeSet.forEach(([cellId]) => {
        cellsArray.push({
          obsId: cellId,
          name: node.name ?? MISSING_VALUE_PLACEHOLDER,
          color: nodeColor,
        });
      });
    }
  }
  return cellsArray;
}

export function treeToCellPolygonsBySetNames(
  currTree, obsIndex, obsEmbedding, selectedNamePaths, cellSetColor, theme,
) {
  const obsIndexMap = getObsIndexMap(obsIndex);
  const cellSetPolygons = [];
  selectedNamePaths.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      const nodeColor = (
        cellSetColor?.find(d => isEqual(d.path, setNamePath))?.color
        || getDefaultColor(theme)
      );
      const cellPositions = nodeSet
        .map(([cellId]) => {
          const cellIdx = obsIndexMap.get(cellId);
          return [
            obsEmbedding.data[0][cellIdx],
            -obsEmbedding.data[1][cellIdx],
          ];
        })
        .filter(cell => cell.every(i => typeof i === 'number'));

      if (cellPositions.length > 2) {
        const points = turfFeatureCollection(
          cellPositions.map(turfPoint),
        );
        const concavity = Infinity;
        const hullCoords = concaveman(cellPositions, concavity);
        if (hullCoords) {
          const centroidCoords = centroid(points).geometry.coordinates;
          cellSetPolygons.push({
            path: setNamePath,
            name: setNamePath[setNamePath.length - 1],
            hull: hullCoords,
            color: nodeColor,
            centroid: centroidCoords,
          });
        }
      }
    }
  });
  return cellSetPolygons;
}

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
export function treeToSetSizesBySetNames(
  currTree, allNamePaths, selectedNamePaths, setColor, theme,
) {
  const sizes = [];

  /**
   * Checks if a path is contained in an array of paths.
   * @param {array} path Array of strings, which compose the path.
   * @param {array} paths Array of arrays of strings, which compose paths.
  * */
  const contains = (path, paths) => paths.some(p => isEqual(p, path));

  allNamePaths.forEach((clusterPath) => {
    const node = treeFindNodeByNamePath(currTree, clusterPath);
    if (node) {
      const nodeSet = nodeToSet(node);
      const nodeColor = setColor?.find(d => isEqual(d.path, clusterPath))?.color
          || getDefaultColor(theme);
      const nodeProps = {
        key: generateKey(),
        name: node.name ?? MISSING_VALUE_PLACEHOLDER,
        size: nodeSet.length,
        color: nodeColor,
        setNamePath: clusterPath,
        // used by the CellSetSizesPlot to determine if the bar should be grayed out
        isGrayedOut: true,
      };
      // if the current path is selected, we need to show it
      if (contains(clusterPath, selectedNamePaths)) {
        nodeProps.isGrayedOut = false;
      }
      sizes.push(nodeProps);
    }
  });
  return sizes;
}

/**
 * Given a tree with state, get the indices of observations
 * contained in each selected obs set.
 * @param {object} currTree A tree object.
 * @param {array} selectedNamePaths Array of arrays of strings,
 * representing set "paths".
 * @returns {object[]} Array of objects
 * with the properties `name`, `size`, `key`,
 * and `color`.
 */
export function treeToObsIdsBySetNames(currTree, selectedNamePaths) {
  const indices = [];
  selectedNamePaths.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      indices.push({
        key: generateKey(),
        name: node.name ?? MISSING_VALUE_PLACEHOLDER,
        path: setNamePath,
        size: nodeSet.length,
        // TODO: handle the case where the ID is in the set but missing
        // from the obsIndexMap
        ids: nodeSet.map(([obsId]) => obsId),
      });
    }
  });
  return indices;
}

/**
 * Given a tree with state, get the indices of observations
 * contained in each selected obs set.
 * @param {object} currTree A tree object.
 * @param {array} selectedNamePaths Array of arrays of strings,
 * representing set "paths".
 * @param {object[]} obsIndex The observation index.
 * @returns {object[]} Array of objects
 * with the properties `name`, `size`, `key`,
 * and `color`.
 */
export function treeToObsIndicesBySetNames(currTree, selectedNamePaths, obsIndexMap) {
  const indices = [];
  selectedNamePaths.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      indices.push({
        key: generateKey(),
        name: node.name ?? MISSING_VALUE_PLACEHOLDER,
        path: setNamePath,
        size: nodeSet.length,
        // TODO: handle the case where the ID is in the set but missing
        // from the obsIndexMap
        indices: nodeSet.map(([obsId]) => obsIndexMap[obsId]),
      });
    }
  });
  return indices;
}

/**
 * Find and remove a node from the descendants of the current node.
 * @param {object} node A node to search on.
 * @param {array} prevPath Path of the current node to be searched.
 * @param {array} filterPath The path sought.
 * @returns {object} A new node without a node at filterPath.
 */
export function filterNode(node, prevPath, filterPath) {
  if (isEqual([...prevPath, node.name], filterPath)) {
    return null;
  }
  if (!node.children) {
    return node;
  }
  return {
    ...node,
    children: node.children.map(
      c => filterNode(c, [...prevPath, node.name], filterPath),
    ).filter(Boolean),
  };
}

export function treeToExpectedCheckedLevel(currTree, checkedPaths) {
  let result = null;
  if (currTree) {
    currTree.tree.forEach((lzn) => {
      const levelZeroPath = [lzn.name];
      const height = nodeToHeight(lzn);
      range(height).forEach((i) => {
        const levelIndex = i + 1;
        const levelNodePaths = nodeToLevelDescendantNamePaths(lzn, levelIndex, [], true);
        if (isEqual(levelNodePaths, checkedPaths)) {
          result = { levelZeroPath, levelIndex };
        }
      });
    });
  }
  return result;
}

export function treesConflict(cellSets, testCellSets) {
  const paths = [];
  const testPaths = [];
  let hasConflict = false;

  function getPaths(node, prevPath) {
    paths.push([...prevPath, node.name]);
    if (node.children) {
      node.children.forEach(c => getPaths(c, [...prevPath, node.name]));
    }
  }
  cellSets.tree.forEach(lzn => getPaths(lzn, []));

  function getTestPaths(node, prevPath) {
    testPaths.push([...prevPath, node.name]);
    if (node.children) {
      node.children.forEach(c => getPaths(c, [...prevPath, node.name]));
    }
  }
  testCellSets.tree.forEach(lzn => getTestPaths(lzn, []));

  testPaths.forEach((testPath) => {
    if (paths.find(p => isEqual(p, testPath))) {
      hasConflict = true;
    }
  });
  return hasConflict;
}

export function initializeCellSetColor(cellSets, cellSetColor) {
  const nextCellSetColor = [...(cellSetColor || [])];
  const nodeCountPerTreePerLevel = cellSets.tree.map(tree => Array
    .from({
      length: nodeToHeight(tree) + 1, // Need to add one because its an array.
    }).fill(0));

  function processNode(node, prevPath, hierarchyLevel, treeIndex) {
    const index = nodeCountPerTreePerLevel[treeIndex][hierarchyLevel];
    const nodePath = [...prevPath, node.name];

    const nodeColor = nextCellSetColor.find(d => isEqual(d.path, nodePath));
    if (!nodeColor) {
      // If there is a color for the node specified via the cell set tree,
      // then use it. Otherwise, use a color from the default color palette.
      const nodeColorArray = (node.color ? node.color : PALETTE[index % PALETTE.length]);
      nextCellSetColor.push({
        path: nodePath,
        color: nodeColorArray,
      });
    }
    nodeCountPerTreePerLevel[treeIndex][hierarchyLevel] += 1;
    if (node.children) {
      node.children.forEach(c => processNode(c, nodePath, hierarchyLevel + 1, treeIndex));
    }
  }

  cellSets.tree.forEach((lzn, treeIndex) => processNode(lzn, [], 0, treeIndex));
  return nextCellSetColor;
}

export function getCellSetPolygons(params) {
  const {
    obsIndex,
    obsEmbedding,
    cellSets,
    cellSetSelection,
    cellSetColor,
    theme,
  } = params;
  if (cellSetSelection && cellSetSelection.length > 0 && cellSets && obsIndex && obsEmbedding) {
    return treeToCellPolygonsBySetNames(
      cellSets, obsIndex, obsEmbedding, cellSetSelection, cellSetColor, theme,
    );
  }
  return [];
}

/**
 * Get every leaf set in a tree, with the path that identifies it.
 *
 * A single depth-first walk visits each leaf exactly once. Iterating one level at a
 * time instead re-emitted any leaf shallower than the tree height once per remaining
 * level, and re-resolved each path against the tree to find its node.
 *
 * @param {object} currTree A tree object.
 * @returns {{ path: string[], set: array[] }[]} The leaf sets, in tree order.
 */
export function treeToLeafSets(currTree) {
  const leafSets = [];
  function visitNode(node, prevPath) {
    const nodePath = [...prevPath, node.name];
    if (node.children) {
      node.children.forEach(child => visitNode(child, nodePath));
    } else {
      leafSets.push({ path: nodePath, set: nodeToSet(node) });
    }
  }
  if (currTree) {
    currTree.tree.forEach(lzn => visitNode(lzn, []));
  }
  return leafSets;
}

/**
 * Get a mapping from observation ID to the paths of the leaf sets containing it.
 * @param {object} currTree A tree object.
 * @returns {Map<string, string[][]>} Mapping from observation ID to set paths.
 */
export function treeToMembershipMap(currTree) {
  const result = new Map();
  treeToLeafSets(currTree).forEach(({ path, set }) => {
    set.forEach(([obsId]) => {
      if (result.has(obsId)) {
        result.get(obsId).push(path);
      } else {
        result.set(obsId, [path]);
      }
    });
  });
  return result;
}

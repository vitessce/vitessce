/* eslint-disable */
import uuidv4 from 'uuid/v4';
import { DEFAULT_COLOR, PALETTE, fromEntries } from '../utils';

/**
 * Like .find but can return the truthy value rather than returning the element.
 * @param {Array} array The array to iterate over.
 * @param {Function} callback The callback function, should return truthy or null.
 * @returns {any} The first return value for which callback returns true.
 */
function findValue(array, callback) {
  // eslint-disable-next-line no-restricted-syntax
  for (const el of array) {
    const callbackResult = callback(el);
    if (callbackResult) {
      return callbackResult;
    }
  }
  return null;
}

/**
 * Remove all instances of a value from an array,
 * based on the result of a test function.
 * @param {Array} array The array to iterate over.
 * @param {Function} shouldRemove The test function. Returns boolean.
 * @returns {Array} The array after removing items.
 */
function removeValue(array, shouldRemove) {
  return array.reduce((a, h) => (shouldRemove(h) ? a : [...a, h]), []);
}

function generateKey() {
  return uuidv4();
}

/**
 * Node class for SetsTree.
 */
export class SetsTreeNode {
  constructor(props) {
    const {
      name,
      isEditing = false,
      isCurrentSet = false,
      color = DEFAULT_COLOR,
      children,
      set,
      level,
    } = props;
    this.key = generateKey();
    this.name = name;
    this.set = set;
    this.children = children;
    this.color = color;
    this.isEditing = isEditing;
    this.isCurrentSet = isCurrentSet;
    this.level = level;
  }

  setIsEditing(v) {
    this.isEditing = v;
  }

  setChildren(children) {
    this.children = children;
  }

  setKey(key) {
    this.key = key;
  }

  /*setSetKey(setKey) {
    this.setKey = setKey;
  }*/

  setName(name) {
    this.name = name;
  }

  setIsCurrentSet(v) {
    this.isCurrentSet = v;
  }

  setColor(v) {
    this.color = v;
  }

  /**
   * Find the node with .isCurrentSet equal to true.
   * @returns {SetsTreeNode} The current set node.
   */
  findCurrentSetNode() {
    if (this.isCurrentSet) {
      return this;
    }
    if (!this.children) {
      return null;
    }
    return findValue(this.children, child => child.findCurrentSetNode());
  }

  /**
   * Find a node of interest.
   * @param {string} setKey The key of the node of interest.
   * @returns {SetsTreeNode} The node of interest.
   */
  findNode(targetKey) {
    if (this.key === targetKey) {
      return this;
    }
    if (!this.children) {
      return null;
    }
    return findValue(this.children, child => child.findNode(targetKey));
  }

  /**
   * Find parent of a node of interest.
   * @param {string} setKey The key of the node of interest.
   * @returns {SetsTreeNode} The parent of the node of interest.
   */
  findParentNode(targetKey) {
    if (!this.children || this.children.length === 0) {
      return null;
    }
    if (this.children.find(child => child.key === targetKey)) {
      return this;
    }
    return findValue(this.children, child => child.findParentNode(targetKey));
  }

  /**
   * Get an object that can be used to render this node.
   * @returns {object} The node's attributes represented as a flat object.
   */
  getRenderProps() {
    return {
      title: this.name,
      nodeKey: this.key,
      size: this.set ? this.set.length : 0,
      color: this.color,
      level: this.level,
      isEditing: this.isEditing,
      isCurrentSet: this.isCurrentSet,
      isLeaf: !this.children,
      height: this.getHeight(this.level),
    };
  }


  /**
   * Return a flat array of descendants at a particular level from this node.
   * @param {integer} level The level of interest.
   *                        0 means children, 1 grandchildren, etc.
   * @returns {SetsTreeNode[]} The array of nodes.
   */
  getDescendantsFlat(level) {
    if (!this.children) {
      return [];
    }
    if (level === 0) {
      return this.children;
    }
    return this.children.flatMap(c => c.getDescendantsFlat(level - 1));
  }

  getHeight(level = 0) {
    if(!this.children) {
      return level;
    } else {
      const childrenHeights = this.children.map(c => c.getHeight(level + 1));
      return Math.max(...childrenHeights, 0);
    }
  }

  getSet() {
    if(!this.children) {
      return this.set || [];
    }
    return this.children.flatMap(c => c.getSet());
  }
}

/**
 * Tree class for storage of hierarchical sets
 * of IDs (cell IDs, gene IDs, etc...).
 */
export default class SetsTree {
  /**
   * Create a SetsTree object.
     * @param {Function} onTreeChange Function called when the tree structure
     *                                or values change.
     * @param {Function} onVisibilityChange Function called when the currently-visible
     *                                      sets array changes.
     */
  constructor(onTreeChange, onVisibilityChange) {
    this.children = [];
    this.items = [];
    this.checkedKeys = [];
    this.visibleKeys = [];
    this.checkedLevel = [null, null]; // tuple of [childKey, levelIndex]
    this.onTreeChange = onTreeChange;
    this.onVisibilityChange = onVisibilityChange;
  }

  /**
   * Set the array of all items to be able to do complement operations.
   * @param {Array} items The array of items.
   */
  setItems(items) {
    this.items = items;
  }

  /**
   * Compute the intersection of specified sets.
   * @param {Array} setKeys An array of the sets of interest.
   * @returns {Array} The resulting set as an array.
   */
  getIntersection(setKeys) {
    const nodes = setKeys.map(key => this.findNode(key));
    if (!nodes || nodes.length === 0) {
      return [];
    }
    const nodeSets = nodes.map(node => node.set || []);
    return nodeSets
      .reduce((a, h) => h.filter(hEl => a.includes(hEl)), nodeSets[0]);
  }

  /**
   * Compute the union of specified sets.
   * @param {Array} setKeys An array of the sets of interest.
   * @returns {Array} The resulting set as an array.
   */
  getUnion(setKeys) {
    const nodes = setKeys.map(key => this.findNode(key));
    if (!nodes || nodes.length === 0) {
      return [];
    }
    const nodeSets = nodes.map(node => node.set || []);
    return nodeSets
      .reduce((a, h) => a.concat(h.filter(hEl => !a.includes(hEl))), nodeSets[0]);
  }

  /**
   * Compute the complement of specified sets.
   * @param {Array} setKeys An array of the sets of interest.
   * @returns {Array} The resulting set as an array.
   */
  getComplement(setKeys) {
    const primaryUnion = this.getUnion(setKeys);
    return this.items.filter(el => !primaryUnion.includes(el));
  }

  /**
   * Set the array of checked node setKey values.
   * @param {string[]} checkedKeys The array of setKey values to check.
   */
  setCheckedKeys(checkedKeys) {
    this.checkedKeys = checkedKeys;
    this.emitTreeUpdate();
  }

  /**
   * Set the array of visible node setKey values.
   * @param {string[]} visibleKeys The array of setKey values to set as visible.
   */
  setVisibleKeys(visibleKeys) {
    this.visibleKeys = visibleKeys;
    this.checkedLevel = [null, null];
    this.emitVisibilityUpdate();
  }

  /**
   * Set the checked level.
   * @param {string} levelZeroNodeKey The key of a level zero node.
   * @param {number} levelIndex The tree level as an integer, 1+
   */
  setCheckedLevel(levelZeroNodeKey, levelIndex) {
    this.checkedLevel = [levelZeroNodeKey, levelIndex];
    this.emitTreeUpdate();
  }

  /**
   * Set the current set's set array value.
   * @param {iterable} set The new set values.
   * @param {boolean} visible Whether to make the current set visible.
   * @param {string} name If provided, will use this name over the default CURRENT_SET_NAME.
   */
  /*setCurrentSet(set, visible, name) {
    let currentSetNode = this.findCurrentSetNode();
    if (!currentSetNode) {
      const uuid = uuidv4();
      currentSetNode = new SetsTreeNode({
        setKey: ALL_ROOT_KEY + PATH_SEP + uuid,
        set: [],
        isEditing: true,
        isCurrentSet: true,
      });
      this.prependChild(currentSetNode);
    }
    currentSetNode.set = Array.from(set);
    if (name) {
      currentSetNode.setName(name);
    } else {
      currentSetNode.setName(CURRENT_SET_NAME);
    }
    if (visible) {
      this.visibleKeys = [currentSetNode.setKey];
    }
    this.emitTreeUpdate();
  }*/

  /**
   * Find the node with .isCurrentSet equal to true.
   * @returns {SetsTreeNode} The current set node.
   */
  /*findCurrentSetNode() {
    return this.root.findCurrentSetNode();
  }*/

  /**
   * Find a node of interest.
   * @param {string} setKey The key of the node of interest.
   * @returns {SetsTreeNode} The node of interest.
   */
  findNode(setKey) {
    for(let child of this.children) {
      const foundNode = child.findNode(setKey);
      if(foundNode) {
        return foundNode;
      }
    }
    return null;
  }

  /**
   * Find parent of a node of interest.
   * @param {string} setKey The key of the node of interest.
   * @returns {SetsTreeNode} The parent of the node of interest.
   */
  findParentNode(setKey) {
    return this.root.findParentNode(setKey);
  }

  /**
   * Rearrange nodes after a drag interaction.
   * Does nothing if the dragNode or dropNode are the current set node.
   * May update node keys to reflect the new hierarchy.
   * @param {string} dropKey The key of the node on which the dragNode was dropped.
   * @param {string} dragKey The key of the node that was dragged.
   * @param {integer} dropPosition The index of the drop.
   * @param {boolean} dropToGap Whether the dragNode should move
   *                            between nodes or become a child.
   */
  dragRearrange(dropKey, dragKey, dropPosition, dropToGap) {
    const dragNode = tabRoot.findNode(dragKey);
    const dragParentNode = tabRoot.findParentNode(dragKey);
    let dragNodeCurrIndex = dragParentNode.children.findIndex(c => c.key === dragKey);

    const dropNode = tabRoot.findNode(dropKey);
    const dropParentNode = tabRoot.findParentNode(dropKey);
    let dropNodeCurrIndex = dropParentNode.children.findIndex(c => c.key === dropKey);

    if (dragNode.isCurrentSet || dropNode.isCurrentSet) {
      return;
    }

    dropNode.setChildren(dropNode.children || []);
    // Remove the dragged object from its current position.
    dragParentNode.children.splice(dragNodeCurrIndex, 1);

    // Update index values after deleting the child node.
    dragNodeCurrIndex = dragParentNode.children.findIndex(c => c.key === dragKey);
    dropNodeCurrIndex = dropParentNode.children.findIndex(c => c.key === dropKey);

    if (!dropToGap) {
      // Set dragNode as last child of dropNode.
      dropNode.setChildren([...dropNode.children, dragNode]);
    } else if (dropPosition === -1) {
      // Set dragNode as first child of dropParentNode.
      dropParentNode.setChildren([dragNode, ...dropParentNode.children]);
    } else {
      dropParentNode.children
        .splice(dropNodeCurrIndex + (dropPosition > dropNodeCurrIndex ? 1 : 0), 0, dragNode);
    }

    this.emitTreeUpdate();
  }

  /**
   * Set isEditing to true for a node of interest.
   * @param {string} setKey The key of the node of interest.
   */
  startEditing(setKey) {
    const node = this.findNode(setKey);
    node.setIsEditing(true);
    this.emitTreeUpdate();
  }

  /**
   * Set the color for a node of interest.
   * @param {string} setKey The key of the node of interest.
   * @param {Array} color The color value as [r, g, b].
   */
  changeNodeColor(setKey, color) {
    const node = this.findNode(setKey);
    node.setColor(color);
    this.emitTreeUpdate();
    this.emitVisibilityUpdate();
  }

  /**
   * Delete a node of interest, and all of its children.
   * @param {string} setKey The key of the node of interest.
   * @param {boolean} preventEmit Whether to prevent the emit event.
   */
  deleteNode(setKey, preventEmit) {
    const node = this.findNode(setKey);
    const parentNode = this.findParentNode(setKey);
    if (!node || !parentNode) {
      return;
    }
    if (node.children) {
      node.children.forEach(c => this.deleteNode(c.key, true));
    }
    // Check whether the node is a tabRoot, remove the corresponding tab(s) if so.
    this.closeTab(setKey, true);
    // Check whether the node is in checkedKeys, remove the corresponding key if so.
    this.checkedKeys = removeValue(this.checkedKeys, h => (h === setKey));
    // Check whether the node is in visibleKeys, remove the corresponding key if so.
    this.visibleKeys = removeValue(this.visibleKeys, h => (h === setKey));

    const nodeIndex = parentNode.children.findIndex(c => c.key === setKey);
    if (nodeIndex === -1) {
      return;
    }
    parentNode.children.splice(nodeIndex, 1);
    if (!preventEmit) {
      this.emitTreeUpdate();
      this.emitVisibilityUpdate();
    }
  }

  /**
   * Change a node's name.
   * @param {string} setKey The key of the node of interest.
   * @param {string} newName The new name value to assign.
   * @param {boolean} stopEditing Whether to also set isEditing to false.
   */
  changeNodeName(setKey, newName, stopEditing) {
    const node = this.findNode(setKey);
    node.setName(newName);

    if (stopEditing) {
      node.setIsEditing(false);
    }
    if (node.isCurrentSet) {
      node.setIsCurrentSet(false);
    }
    this.emitTreeUpdate();
  }

  /**
   * Prepend a child to the root node's children array.
   * May update node keys to reflect the new hierarchy.
   * @param {SetsTreeNode} node The child node to prepend.
   */
  prependChild(node) {
    this.setChildren([node, ...this.children]);
  }

  /**
   * Append a child to the root node's children array.
   * May update node keys to reflect the new hierarchy.
   * @param {SetsTreeNode} node The child node to append.
   */
  appendChild(node) {
    this.setChildren([...this.children, node]);
  }

  /**
   * Set the array of children nodes for the root node.
   * May update node keys to reflect the new hierarchy.
   * @param {SetsTreeNode[]} children The array of child nodes to append.
   */
  setChildren(children) {
    this.children = children;
    this.emitTreeUpdate();
  }

  /**
   * Set a set node to visible based on its key.
   * Discards any previously-visible sets.
   * @param {string} setKey The key of the node of interest.
   */
  viewSet(setKey) {
    this.visibleKeys = [setKey];
    this.checkedLevel = [null, null];
    this.emitVisibilityUpdate();
  }

  /**
   * Set all of a set node's descendents at a particular level
   * to visible based on its key.
   * Discards any previously-visible sets.
   * @param {string} setKey The key of the node of interest.
   * @param {integer} level The level of interest. 0 means children, 1 grandchildren, etc.
   */
  viewSetDescendants(setKey, level) {
    const node = this.findNode(setKey);
    const descendentsOfInterest = node.getDescendantsFlat(level);
    this.visibleKeys = descendentsOfInterest.map(d => d.key);
    this.emitVisibilityUpdate();
  }

 
  /**
   * Import previously-exported sets.
   * Assumes a hierarchical ordering.
   * Will append the root of the import to the current root's children.
   * @param {Array} data A previously-exported array of set objects.
   * @param {string} name The name for the new dummy ancestor node.
   * @param {boolean} isTrusted Whether these sets are trusted, which
   * enables them to replace the root node children and prevents deletion.
   * By default, false.
   */
  import(data) {
    if (!data || data.length < 1) {
      return;
    }

    function makeNode(nodeToImport, siblingIndex = 0, level = 0) {
      let node;
      let childrenNodes = [];
      if(nodeToImport.children) {
        // Recursively convert children nodes to SetsTreeNode objects.
        childrenNodes = nodeToImport.children.map((c, i) => makeNode(c, i, level + 1));
      }
      if(nodeToImport.children) {
        node = new SetsTreeNode({
          name: nodeToImport.name,
          color: (level > 0 ? nodeToImport.color : undefined),
          children: childrenNodes,
          level,
        });
      } else {
        node = new SetsTreeNode({
          name: nodeToImport.name,
          color: nodeToImport.color,
          set: nodeToImport.set,
          level,
        });
      }
      if (level > 0 && !nodeToImport.color) {
        node.setColor(PALETTE[siblingIndex % PALETTE.length]);
      }
      return node;
    }

    data.forEach((levelZeroNodeToImport) => {
      const levelZeroNode = makeNode(levelZeroNodeToImport);
      this.appendChild(levelZeroNode);
    });
  }

  /**
   * Create an array that can be imported.
   * @returns {Array} An array of plain objects.
   */
  export() {
    const result = [];
    let dfs = [...this.root.children];
    while (dfs.length > 0) {
      const currNode = dfs.pop();
      result.push({
        name: currNode.name,
        color: currNode.color,
        set: currNode.set,
      });
      dfs = dfs.concat(currNode.children || []);
    }
    return result;
  }

  /**
   * Call .onTreeChange with the current this value.
   */
  emitTreeUpdate() {
    if (this.onTreeChange) {
      this.onTreeChange(this);
    }
  }

  /**
   * Call .onVisibilityChange with the currently-visible set items
   * in a single Set object.
   */
  emitVisibilityUpdate() {
    if (this.onVisibilityChange) {
      let cellColorsArray = [];
      this.visibleKeys.forEach((setKey) => {
        const node = this.findNode(setKey);
        if (node) {
          const nodeSet = node.getSet();
          cellColorsArray = [
            ...cellColorsArray,
            ...nodeSet.map(cellId => [cellId, node.color]),
          ];
        }
      });
      const cellIds = cellColorsArray.map(c => c[0]);
      const cellColors = fromEntries(cellColorsArray);
      this.onVisibilityChange(new Set(cellIds), cellColors);
    }
  }
}

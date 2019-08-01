import uuidv4 from 'uuid/v4';

const CURRENT_SET_NAME = 'Current selection';
const ALL_ROOT_KEY = 'all';
const ALL_ROOT_NAME = 'All';
const PATH_SEP = '\t';

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
 * Node class for SetsTree.
 */
export class SetsTreeNode {
  constructor(props) {
    const {
      setKey,
      name,
      isRoot = false,
      isEditing = false,
      isCurrentSet = false,
      wasPreviousCurrentSet = false,
      color,
      children,
      set,
    } = props;
    this.setKey = setKey;
    this.name = name;
    this.set = set;
    this.children = children;
    this.color = color;
    this.isRoot = isRoot;
    this.isEditing = isEditing;
    this.isCurrentSet = isCurrentSet;
    this.wasPreviousCurrentSet = wasPreviousCurrentSet;
  }

  setIsEditing(v) {
    this.isEditing = v;
  }

  setChildren(children) {
    this.children = children;
  }

  setSetKey(setKey) {
    this.setKey = setKey;
  }

  setName(name) {
    this.name = name;
  }

  setIsCurrentSet(v) {
    this.isCurrentSet = v;
  }

  setWasPreviousCurrentSet(v) {
    this.wasPreviousCurrentSet = v;
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
  findNode(setKey) {
    if (this.setKey === setKey) {
      return this;
    }
    if (!this.children) {
      return null;
    }
    return findValue(this.children, child => child.findNode(setKey));
  }

  /**
   * Find parent of a node of interest.
   * @param {string} setKey The key of the node of interest.
   * @returns {SetsTreeNode} The parent of the node of interest.
   */
  findParentNode(setKey) {
    if (!this.children || this.children.length === 0) {
      return null;
    }
    if (this.children.find(child => child.setKey === setKey)) {
      return this;
    }
    return findValue(this.children, child => child.findParentNode(setKey));
  }

  /**
   * Get an object that can be used to render this node.
   * @returns {object} The node's attributes represented as a flat object.
   */
  getRenderProps() {
    return {
      title: this.name,
      setKey: this.setKey,
      size: this.set ? this.set.length : 0,
      level: this.getLevel(),
      isRoot: this.isRoot,
      isEditing: this.isEditing,
      isCurrentSet: this.isCurrentSet,
      wasPreviousCurrentSet: this.wasPreviousCurrentSet,
    };
  }

  /**
   * Get the last part of the key, after the final period.
   * If no period, return the whole key string.
   * @returns {string} The tail of the key.
   */
  getKeyTail() {
    return this.setKey.match(new RegExp(`^(.*${PATH_SEP})*([^${PATH_SEP}]*)$`))[2];
  }

  /**
   * Get the first part of the key, before the final period.
   * Assumes there will be at least one period.
   * @returns {string} The head of the key.
   */
  getKeyHead() {
    return this.setKey.match(new RegExp(`^(.*)${PATH_SEP}[^${PATH_SEP}]*$`))[1];
  }

  /**
   * Return the level of the node relative to the "bottom" of the tree.
   * @returns {integer} The level.
   *                    0 means leaf, 1 has children, 2 grandchildren, etc.
   */
  getLevel() {
    if (!this.children || this.children.length === 0) {
      return 0;
    }
    return Math.max(...this.children.map(child => child.getLevel() + 1));
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

  /**
   * Update child keys, keeping the same key tails but updating
   * key head "paths" to match the current tree structure.
   */
  updateChildKeys() {
    if (!this.children) {
      return;
    }
    this.children.forEach((child) => {
      const newChildKey = this.setKey + PATH_SEP + child.getKeyTail();
      // TODO: check for existence of duplicate keys before setting the key.
      child.setSetKey(newChildKey);
      child.updateChildKeys();
    });
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
    this.root = new SetsTreeNode({
      setKey: ALL_ROOT_KEY,
      name: ALL_ROOT_NAME,
      children: [],
      isRoot: true,
    });
    this.items = [];
    this.tabRoots = [this.root];
    this.checkedKeys = [];
    this.visibleKeys = [];
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
    this.emitVisibilityUpdate();
  }

  /**
   * Set the current set's set array value.
   * @param {iterable} set The new set values.
   * @param {boolean} visible Whether to make the current set visible.
   * @param {string} name If provided, will use this name over the default CURRENT_SET_NAME.
   */
  setCurrentSet(set, visible, name) {
    let currentSetNode = this.findCurrentSetNode();
    if (!currentSetNode) {
      const uuid = uuidv4();
      currentSetNode = new SetsTreeNode({
        setKey: ALL_ROOT_KEY + PATH_SEP + uuid,
        color: '#000',
        set: [],
        isEditing: true,
        isCurrentSet: true,
        wasPreviousCurrentSet: true,
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
  }

  /**
   * Find the node with .isCurrentSet equal to true.
   * @returns {SetsTreeNode} The current set node.
   */
  findCurrentSetNode() {
    return this.root.findCurrentSetNode();
  }

  /**
   * Find a node of interest.
   * @param {string} setKey The key of the node of interest.
   * @returns {SetsTreeNode} The node of interest.
   */
  findNode(setKey) {
    return this.root.findNode(setKey);
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
   * Rearrange nodes after a drag interaction (within a particular tab's subtree).
   * Does nothing if the dragNode or dropNode are the current set node.
   * May update node keys to reflect the new hierarchy.
   * @param {SetsTreeNode} tabRoot The root of the subtree in which the drag occurred.
   * @param {string} dropKey The key of the node on which the dragNode was dropped.
   * @param {string} dragKey The key of the node that was dragged.
   * @param {integer} dropPosition The index of the drop.
   * @param {boolean} dropToGap Whether the dragNode should move
   *                            between nodes or become a child.
   */
  dragRearrange(tabRoot, dropKey, dragKey, dropPosition, dropToGap) {
    const dragNode = tabRoot.findNode(dragKey);
    const dragParentNode = tabRoot.findParentNode(dragKey);
    let dragNodeCurrIndex = dragParentNode.children.findIndex(c => c.setKey === dragKey);

    const dropNode = tabRoot.findNode(dropKey);
    const dropParentNode = tabRoot.findParentNode(dropKey);
    let dropNodeCurrIndex = dropParentNode.children.findIndex(c => c.setKey === dropKey);

    if (dragNode.isCurrentSet || dropNode.isCurrentSet) {
      return;
    }

    dropNode.setChildren(dropNode.children || []);
    // Remove the dragged object from its current position.
    dragParentNode.children.splice(dragNodeCurrIndex, 1);

    // Update index values after deleting the child node.
    dragNodeCurrIndex = dragParentNode.children.findIndex(c => c.setKey === dragKey);
    dropNodeCurrIndex = dropParentNode.children.findIndex(c => c.setKey === dropKey);

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

    tabRoot.updateChildKeys();
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
      node.children.forEach(c => this.deleteNode(c.setKey, true));
    }
    // Check whether the node is a tabRoot, remove the corresponding tab(s) if so.
    this.closeTab(setKey, true);
    // Check whether the node is in checkedKeys, remove the corresponding key if so.
    this.checkedKeys = this.checkedKeys.reduce((a, h) => (h === setKey ? a : [...a, h]), []);
    // Check whether the node is in visibleKeys, remove the corresponding key if so.
    this.visibleKeys = this.visibleKeys.reduce((a, h) => (h === setKey ? a : [...a, h]), []);

    const nodeIndex = parentNode.children.findIndex(c => c.setKey === setKey);
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
      if (node.wasPreviousCurrentSet) {
        node.setWasPreviousCurrentSet(false);
      }
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
    this.root.setChildren([node, ...this.root.children]);
    this.root.updateChildKeys();
    this.emitTreeUpdate();
  }

  /**
   * Append a child to the root node's children array.
   * May update node keys to reflect the new hierarchy.
   * @param {SetsTreeNode} node The child node to append.
   */
  appendChild(node) {
    this.root.setChildren([...this.root.children, node]);
    this.root.updateChildKeys();
    this.emitTreeUpdate();
  }

  /**
   * Set a set node to visible based on its key.
   * Discards any previously-visible sets.
   * @param {string} setKey The key of the node of interest.
   */
  viewSet(setKey) {
    this.visibleKeys = [setKey];
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
    this.visibleKeys = descendentsOfInterest.map(d => d.setKey);
    this.emitVisibilityUpdate();
  }

  /**
   * Add a new tab root.
   * @param {string} setKey The key of the node to be used as the tab root.
   */
  newTab(setKey) {
    const node = this.findNode(setKey);
    // Only add a tab if it does not already exist.
    if (!this.tabRoots.find(t => t.setKey === setKey)) {
      this.tabRoots = [...this.tabRoots, node];
      this.emitTreeUpdate();
    }
  }

  /**
   * Remove a tab root by its key.
   * @param {string} setKey The key of the tab root node to be removed.
   * @param {boolean} preventEmit Whether to prevent the emit event.
   */
  closeTab(setKey, preventEmit) {
    this.tabRoots = this.tabRoots.reduce((a, h) => (h.setKey === setKey ? a : [...a, h]), []);
    if (!preventEmit) {
      this.emitTreeUpdate();
    }
  }

  /**
   * Import previously-exported sets.
   * Assumes a hierarchical ordering.
   * Will append the root of the import to the current root's children.
   * @param {Array} data A previously-exported array of set objects.
   * @param {string} name The name for the new dummy ancestor node.
   */
  import(data, name) {
    if (!data || data.length < 1) {
      return;
    }
    const uuid = uuidv4();
    const importRoot = new SetsTreeNode({
      setKey: uuid,
      name,
    });

    data.forEach((nodeObj) => {
      const node = new SetsTreeNode({
        setKey: nodeObj.key,
        name: nodeObj.name,
        color: nodeObj.color,
        set: nodeObj.set,
      });
      let parentNode;
      if (node.setKey.lastIndexOf(PATH_SEP) === -1) {
        parentNode = importRoot;
      } else {
        parentNode = importRoot.findNode(node.getKeyHead());
      }
      parentNode.setChildren([...(parentNode.children || []), node]);
    });
    this.appendChild(importRoot);
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
        key: currNode.setKey.substring(ALL_ROOT_KEY.length + PATH_SEP.length),
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
      let cellIds = [];
      this.visibleKeys.forEach((setKey) => {
        const node = this.findNode(setKey);
        if (node && node.set && node.set.length > 0) {
          cellIds = [...cellIds, ...node.set];
        }
      });
      this.onVisibilityChange(new Set(cellIds));
    }
  }
}

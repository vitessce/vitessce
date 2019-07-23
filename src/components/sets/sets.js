import uuidv4 from 'uuid/v4';

const CURRENT_SET_NAME = 'Current Selection';
const ALL_ROOT_KEY = 'all';
const ALL_ROOT_NAME = 'All';

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
      isEditing = false,
      isCurrentSet = false,
      wasPreviousCurrentSet = false,
      color,
      children,
      set,
    } = props || {};
    this.setKey = setKey;
    this.name = name;
    this.set = set;
    this.children = children;
    this.color = color;
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

  findNode(setKey) {
    if (this.setKey === setKey) {
      return this;
    }
    if (!this.children) {
      return null;
    }
    return findValue(this.children, child => child.findNode(setKey));
  }

  findParentNode(setKey) {
    if (!this.children || this.children.length === 0) {
      return null;
    }
    if (this.children.find(child => child.setKey === setKey)) {
      return this;
    }
    return findValue(this.children, child => child.findParentNode(setKey));
  }

  findCurrentSetNode() {
    if (this.isCurrentSet) {
      return this;
    }
    if (!this.children) {
      return null;
    }
    return findValue(this.children, child => child.findCurrentSetNode());
  }

  getRenderProps() {
    return {
      title: this.name,
      key: this.setKey,
      setKey: this.setKey,
      size: this.set ? this.set.length : 0,
      level: this.getLevel(),
      isEditing: this.isEditing,
      isCurrentSet: this.isCurrentSet,
      wasPreviousCurrentSet: this.wasPreviousCurrentSet,
    };
  }

  getKeyTail() {
    const i = this.setKey.lastIndexOf('.');
    if (i === -1) {
      return this.setKey;
    }
    return this.setKey.substring(i + 1);
  }

  getKeyHead() {
    const i = this.setKey.lastIndexOf('.');
    return this.setKey.substring(0, i);
  }

  getLevel() {
    if (!this.children || this.children.length === 0) {
      return 0;
    }
    let maxLevel = 0;
    this.children.forEach((child) => {
      const potentialLevel = child.getLevel() + 1;
      if (maxLevel < potentialLevel) {
        maxLevel = potentialLevel;
      }
    });
    return maxLevel;
  }

  getDescendentsFlat(level) {
    if (!this.children) {
      return [];
    }
    if (level === 0) {
      return this.children;
    }
    return this.children.flatMap(c => c.getDescendentsFlat(level - 1));
  }

  setKeyTail(keyTail) {
    const keyHead = this.getKeyHead();
    this.setKey = `${keyHead}.${keyTail}`;
  }

  updateChildKeys() {
    if (!this.children) {
      return;
    }
    this.children.forEach((child) => {
      const newChildKey = `${this.setKey}.${child.getKeyTail()}`;
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
     * or values change.
     * @param {Function} onVisibilityChange Function called when the currently-visible
     * sets array changes.
     */
  constructor(onTreeChange, onVisibilityChange) {
    this.root = new SetsTreeNode({
      setKey: ALL_ROOT_KEY,
      name: ALL_ROOT_NAME,
      children: [],
    });
    this.tabRoots = [this.root];
    this.checkedKeys = [];
    this.visibleKeys = [];
    this.onTreeChange = onTreeChange;
    this.onVisibilityChange = onVisibilityChange;
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
   * Set the current set's set array value.
   * @param {iterable} set The new set values.
   * @param {boolean} visible Whether to make the current set visible.
   */
  setCurrentSet(set, visible) {
    let currentSetNode = this.findCurrentSetNode();
    if (!currentSetNode) {
      const uuid = uuidv4();
      currentSetNode = new SetsTreeNode({
        setKey: `${ALL_ROOT_KEY}.${uuid}`,
        name: CURRENT_SET_NAME,
        color: '#000',
        set: [],
        isEditing: true,
        isCurrentSet: true,
        wasPreviousCurrentSet: true,
      });
      this.prependChild(currentSetNode);
    }
    currentSetNode.set = Array.from(set);
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
   * between nodes or become a child.
   * @param {boolean} insertBottom Whether the node should be appended to the bottom.
   */
  dragRearrange(tabRoot, dropKey, dragKey, dropPosition, dropToGap, insertBottom) {
    const dragNode = this.findNode(dragKey);
    const dropNode = this.findNode(dropKey);
    if (dragNode.isCurrentSet || dropNode.isCurrentSet) {
      return;
    }
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.setKey === key) {
          callback(item, index, arr);
        } else if (item.children) {
          loop(item.children, key, callback);
        }
      });
    };
    const data = [...tabRoot.children];

    // Find dragObject.
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!dropToGap) {
      // Set as last child of the dropKey node.
      loop(data, dropKey, (item) => {
        item.setChildren(item.children || []);
        item.setChildren([...item.children, dragObj]);
      });
    } else if (insertBottom) {
      // Set as first child of the dropKey node.
      loop(data, dropKey, (item) => {
        item.setChildren(item.children || []);
        const newChildren = [...item.children];
        newChildren.unshift(dragObj);
        item.setChildren(newChildren);
      });
    } else {
      // Set at intermediate position within dropKey node's children.
      let ar;
      let i;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }

    tabRoot.setChildren(data);
    tabRoot.updateChildKeys();
    this.emitTreeUpdate();
  }

  /**
   * Set isEditing to true for a node of interest.
   * @param {string} setKey The key of the node of interest.
   */
  onStartEditing(setKey) {
    const node = this.findNode(setKey);
    node.setIsEditing(true);
    this.emitTreeUpdate();
  }

  /**
   * Delete a node of interest.
   * @param {string} setKey The key of the node of interest.
   */
  onDelete(setKey) {
    const parentNode = this.findParentNode(setKey);
    if (!parentNode) {
      return;
    }
    const nodeIndex = parentNode.children.find(c => c.setKey === setKey);
    if (!nodeIndex) {
      return;
    }
    parentNode.children.splice(nodeIndex, 1);
    this.emitTreeUpdate();
  }

  /**
   * Change a node's name.
   * @param {string} setKey The key of the node of interest.
   * @param {string} newName The new name value to assign.
   * @param {boolean} stopEditing Whether to also set isEditing to false.
   */
  onChangeNodeName(setKey, newName, stopEditing) {
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
    // TODO: check for existence of duplicate keys before setting the key.
    this.emitTreeUpdate();
  }

  /**
   * Prepend a child to the root node's children array.
   * @param {SetsTreeNode} node The child node to prepend.
   */
  prependChild(node) {
    this.root.setChildren([node, ...this.root.children]);
    this.emitTreeUpdate();
  }

  /**
   * Append a child to the root node's children array.
   * @param {SetsTreeNode} node The child node to append.
   */
  appendChild(node) {
    this.root.setChildren([...this.root.children, node]);
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
  viewSetDescendents(setKey, level) {
    const node = this.findNode(setKey);
    const descendentsOfInterest = node.getDescendentsFlat(level);
    this.visibleKeys = descendentsOfInterest.map(d => d.setKey);
    this.emitVisibilityUpdate();
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

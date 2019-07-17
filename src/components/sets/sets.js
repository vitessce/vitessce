/* eslint-disable no-prototype-builtins */
import store from 'store';
import slugify from 'slugify';
// Functions for storing hierarchical sets of string IDs (cell IDs, gene IDs, etc...).

const CURRENT_SET_KEY = 'current-set';
const CURRENT_SET_NAME = 'Current Selection';
const ALL_ROOT_KEY = 'all';
const ALL_ROOT_NAME = 'All';

export class HSetsNode {
  constructor(props) {
    const {
      setKey,
      name,
      editing = false,
      color,
      children,
      set,
    } = props || {};
    this.setKey = setKey;
    this.name = name;
    this.set = set;
    this.children = children;
    this.color = color;
    this.editing = editing;
  }

  isCurrentSet() {
    return (this.setKey === `${ALL_ROOT_KEY}.${CURRENT_SET_KEY}`);
  }

  startEditing() {
    this.editing = true;
  }

  stopEditing() {
    this.editing = false;
  }

  isEditing() {
    return this.editing;
  }

  setChildren(children) {
    this.children = children;
  }

  setName(name) {
    this.name = name;
  }

  isLeaf() {
    return (this.children === undefined
        || this.children === null
        || (Array.isArray(this.children) && this.children.length === 0));
  }

  findNode(setKey) {
    if (this.setKey === setKey) {
      return this;
    }
    if (!this.children) {
      return null;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const child of this.children) {
      const childResult = child.findNode(setKey);
      if (childResult) {
        return childResult;
      }
    }
    return null;
  }

  getRenderProps() {
    return {
      title: this.name,
      key: this.setKey,
      setKey: this.setKey,
      size: this.set ? this.set.length : 0,
      isCurrentSet: this.isCurrentSet(),
      isEditing: this.isEditing(),
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

  setKeyTail(keyTail) {
    const keyHead = this.getKeyHead();
    this.setKey = `${keyHead}.${keyTail}`;
  }

  updateChildKeys() {
    if (this.children && this.children.length > 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const child of this.children) {
        const newChildKey = `${this.setKey}.${child.getKeyTail()}`;
        child.setKey = newChildKey;
        child.updateChildKeys();
      }
    }
  }
}

export default class HSets {
  constructor(onTreeChange, onVisibilityChange) {
    this.root = new HSetsNode({
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

  setCheckedKeys(checkedKeys) {
    this.checkedKeys = checkedKeys;
    this.emitTreeUpdate();
  }

  setCurrentSet(set, visible) {
    let currentSetNode = this.findNode(`${ALL_ROOT_KEY}.${CURRENT_SET_KEY}`);
    if (!currentSetNode) {
      currentSetNode = new HSetsNode({
        setKey: `${ALL_ROOT_KEY}.${CURRENT_SET_KEY}`,
        name: CURRENT_SET_NAME,
        color: '#000',
        editing: true,
        set: [],
      });
      this.prependChild(currentSetNode);
    }
    currentSetNode.set = Array.from(set);
    if (visible) {
      this.visibleKeys = [currentSetNode.setKey];
    }
    this.emitTreeUpdate();
  }

  findNode(setKey) {
    return this.root.findNode(setKey);
  }

  dragRearrange(tabRoot, dropKey, dragKey, dropPosition, dropToGap, insertBottom) {
    if (dragKey === `${ALL_ROOT_KEY}.${CURRENT_SET_KEY}` || dropKey === `${ALL_ROOT_KEY}.${CURRENT_SET_KEY}`) {
      return;
    }
    const loop = (data, key, callback) => {
      // eslint-disable-next-line consistent-return
      data.forEach((item, index, arr) => {
        if (item.setKey === key) {
          return callback(item, index, arr);
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
      });
    };
    const data = [...tabRoot.children];

    // Find dragObject
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!dropToGap) {
      // Drop on the content
      loop(data, dropKey, (item) => {
        item.setChildren(item.children || []);
        // where to insert
        item.setChildren([...item.children, dragObj]);
      });
    } else if (insertBottom) {
      loop(data, dropKey, (item) => {
        item.setChildren(item.children || []);
        // where to insert
        const newChildren = [...item.children];
        newChildren.unshift(dragObj);
        item.setChildren(newChildren);
      });
    } else {
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

  onChangeNodeName(prevKey, newName, changeKey) {
    const node = this.findNode(prevKey);
    node.setName(newName);
    if (changeKey) {
      const newKeyTail = slugify(newName, { remove: /[.]/g });
      node.setKeyTail(newKeyTail);
      // Keep the node checked through the name change if necessary.
      if (this.checkedKeys.includes(prevKey)) {
        this.checkedKeys.splice(this.checkedKeys.indexOf(prevKey), 1, node.setKey);
      }
    }
    // TODO: check for existence of duplicate keys before setting the key
    this.emitTreeUpdate();
  }

  prependChild(node) {
    this.root.setChildren([node, ...this.root.children]);
    this.emitTreeUpdate();
  }

  appendChild(node) {
    this.root.setChildren([...this.root.children, node]);
    this.emitTreeUpdate();
  }

  viewSet(setKey) {
    this.visibleKeys = [setKey];
    this.emitVisibilityUpdate();
  }

  emitTreeUpdate() {
    if (this.onTreeChange) {
      this.onTreeChange(this);
    }
  }

  emitVisibilityUpdate() {
    if (this.onVisibilityChange) {
      let cellIds = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const setKey of this.visibleKeys) {
        const node = this.findNode(setKey);
        if (node && node.set && node.set.length > 0) {
          cellIds = [...cellIds, ...node.set];
        }
      }
      this.onVisibilityChange(new Set(cellIds));
    }
  }
}

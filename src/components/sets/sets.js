/* eslint-disable no-prototype-builtins */
import store from 'store';
import slugify from 'slugify';
// Functions for storing hierarchical sets of string IDs (cell IDs, gene IDs, etc...).

const CURRENT_SET_KEY = 'current-set';
const CURRENT_SET_NAME = 'Current Set';
const ALL_ROOT_KEY = 'all';
const ALL_ROOT_NAME = 'All';

export class HSetsNode {
  constructor(props) {
    const {
      setKey,
      name,
      selected = false,
      open = false,
      color,
      children,
      set,
    } = props || {};
    this.setKey = setKey;
    this.name = name;
    this.children = children;
    this.selected = selected;
    this.color = color;
    this.open = open;
    this.set = set;
    this.editing = false;
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

  setKeyTail(keyTail) {
    const i = this.setKey.lastIndexOf('.');
    const keyHead = this.setKey.substring(0, i + 1);
    this.setKey = keyHead + keyTail;
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
  constructor(onChange) {
    this.root = new HSetsNode({
      setKey: ALL_ROOT_KEY,
      name: ALL_ROOT_NAME,
      children: [
        new HSetsNode({
          setKey: 'all.current-set',
          name: CURRENT_SET_NAME,
          color: '#000',
          set: [],
        }),
        /* new HSetsNode({
          setKey: 'all.factors',
          name: 'Factors',
          color: '#000',
        }), */
      ],
    });
    this.tabRoots = [this.root];
    this.checkedKeys = ['all.current-set'];
    this.onChange = onChange;
  }

  setCheckedKeys(checkedKeys) {
    this.checkedKeys = checkedKeys;
    this.emitUpdate();
  }

  setCurrentSet(set) {
    this.findNode(`${ALL_ROOT_KEY}.${CURRENT_SET_KEY}`).set = Array.from(set);
    this.emitUpdate();
  }

  findNode(setKey) {
    return this.root.findNode(setKey);
  }

  dragRearrange(tabRoot, dropKey, dragKey, dropPosition, dropToGap, insertBottom) {
    if (dragKey === 'all.current-set' || dropKey === 'all.current-set') {
      return;
    }
    const loop = (data, key, callback) => {
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
    if (dragKey === 'all.current-set') {
      this.root.setChildren([new HSetsNode({
        setKey: 'all.current-set',
        name: CURRENT_SET_NAME,
        color: '#000',
        set: [],
      }), ...this.root.children]);
    }
    this.emitUpdate();
  }

  onChangeNodeName(prevKey, newName) {
    const node = this.findNode(prevKey);
    node.setName(newName);
    const newKeyTail = slugify(newName, { remove: /[.]/g });
    node.setKeyTail(newKeyTail);
    this.emitUpdate();
  }

  appendChild(node) {
    this.root.setChildren([...this.root.children, node]);
    this.emitUpdate();
  }

  emitUpdate() {
    if (this.onChange) {
      this.onChange(this);
    }
  }
}

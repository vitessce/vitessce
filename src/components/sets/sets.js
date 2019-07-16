/* eslint-disable no-prototype-builtins */
import store from 'store';
// Functions for storing hierarchical sets of string IDs (cell IDs, gene IDs, etc...).

const CURRENT_SET_KEY = 'current-set';
const CURRENT_SET_NAME = 'Current Set';
const ALL_ROOT_KEY = 'all';
const ALL_ROOT_NAME = 'All';

export class HSetsNode {
  constructor(props) {
    const {
      key,
      name,
      selected = false,
      open = false,
      color,
      children,
      set,
    } = props || {};
    this.key = key;
    this.name = name;
    this.children = children;
    this.selected = selected;
    this.color = color;
    this.open = open;
    this.set = set;
    this.editing = false;
  }

  isCurrentSet() {
    return (this.key === `${ALL_ROOT_KEY}.${CURRENT_SET_KEY}`);
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

  isLeaf() {
    return (this.children === undefined
        || this.children === null
        || (Array.isArray(this.children) && this.children.length === 0));
  }

  findNode(key) {
    if (this.key === key) {
      return this;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const child of this.children) {
      const childResult = child.findNode(key);
      if (childResult) {
        return childResult;
      }
    }
    return null;
  }

  getRenderProps() {
    return {
      title: this.name,
      key: this.key,
      size: this.set ? this.set.length : 0,
      isCurrentSet: this.isCurrentSet(),
      isEditing: this.isEditing(),
    };
  }

  getKeyTail() {
    const i = this.key.lastIndexOf('.');
    if (i === -1) {
      return this.key;
    }
    return this.key.substring(i + 1);
  }

  updateChildKeys() {
    if (this.children && this.children.length > 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const child of this.children) {
        const newChildKey = `${this.key}.${child.getKeyTail()}`;
        child.key = newChildKey;
        child.updateChildKeys();
      }
    }
  }
}

export default class HSets {
  constructor(onChange) {
    this.root = new HSetsNode({
      key: ALL_ROOT_KEY,
      name: ALL_ROOT_NAME,
      children: [
        new HSetsNode({
          key: 'all.current-set',
          name: CURRENT_SET_NAME,
          color: '#000',
          set: [],
        }),
        new HSetsNode({
          key: 'all.factors',
          name: 'Factors',
          color: '#000',
          children: [
            new HSetsNode({
              key: 'all.factors.oligodendrocytes',
              name: 'Oligodendrocytes',
              color: '#000',
              children: [
                new HSetsNode({
                  key: 'all.factors.oligodendrocytes.oligodendrocyte-mature',
                  name: 'Oligodendrocyte Mature',
                  color: '#000',
                  set: [],
                }),
              ],
            }),
            new HSetsNode({
              key: 'all.factors.inhibitory-neurons',
              name: 'Inhibitory neurons',
              color: '#000',
              children: [
                new HSetsNode({
                  key: 'all.factors.inhibitory-neurons.inhibitory-pthlh',
                  name: 'Inhibitory Pthlh',
                  color: '#000',
                  set: [],
                }),
                new HSetsNode({
                  key: 'all.factors.inhibitory-neurons.inhibitory-kcnip2',
                  name: 'Inhibitory Kcnip2',
                  color: '#000',
                  set: [],
                }),
                new HSetsNode({
                  key: 'all.factors.inhibitory-neurons.inhibitory-cp',
                  name: 'Inhibitory CP',
                  color: '#000',
                  set: [],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    this.tabRoots = [this.root, this.root.children[1].children[0]];
    this.checkedKeys = ['all.current-set'];
    this.onChange = onChange || (() => {});
  }

  setCheckedKeys(checkedKeys) {
    this.checkedKeys = checkedKeys;
    this.onChange(this);
  }

  setCurrentSet(set) {
    this.findNode(`${ALL_ROOT_KEY}.${CURRENT_SET_KEY}`).set = Array.from(set);
    this.onChange(this);
  }

  findNode(key) {
    return this.root.findNode(key);
  }

  dragRearrange(tabRoot, dropKey, dragKey, dropPosition, dropToGap, insertBottom) {
    if (dragKey === 'all.current-set' || dropKey === 'all.current-set') {
      return;
    }
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
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
        key: 'all.current-set',
        name: CURRENT_SET_NAME,
        color: '#000',
        set: [],
      }), ...this.root.children]);
    }
    this.onChange(this);
  }
}

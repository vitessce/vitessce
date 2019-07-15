/* eslint-disable no-prototype-builtins */
import store from 'store';
// Functions for storing hierarchical sets of string IDs (cell IDs, gene IDs, etc...).

export class HSetsNode {
  constructor({
    name,
    selected = false,
    open = false,
    color,
    children,
    set,
  }) {
    this.name = name;
    this.children = children;
    this.selected = selected;
    this.color = color;
    this.open = open;
    this.set = set;
  }

  isLeaf() {
    return (this.children === undefined
        || this.children === null
        || (Array.isArray(this.children) && this.children.length === 0));
  }
}

export default class HSets {
  constructor() {
    this.root = HSetsNode();
    this.root.children = [HSetsNode({
      name: 'Current Set', color: '#000', set: [],
    })];
    this.tabRoots = [this.root];
  }
}

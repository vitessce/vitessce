/* eslint-disable no-prototype-builtins */
import store from 'store';
// Functions for storing hierarchical sets of string IDs (cell IDs, gene IDs, etc...).

export class HSetsNode {
  constructor(props) {
    const {
      name,
      selected = false,
      open = false,
      color,
      children,
      set,
    } = props || {};
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

  getRenderData(root) {
    if (root) {
      return this.children ? this.children.map(child => child.getRenderData(false)) : [];
    }
    return {
      title: this.name,
      key: this.name,
      size: this.set ? this.set.length : 0,
      children: this.children ? this.children.map(child => child.getRenderData(false)) : undefined,
    };
  }
}

export default class HSets {
  constructor() {
    this.root = new HSetsNode({
      name: 'All',
      children: [
        new HSetsNode({
          name: 'Current Set',
          color: '#000',
          set: [],
        }),
        new HSetsNode({
          name: 'Factors',
          color: '#000',
          children: [
            new HSetsNode({
              name: 'Oligodendrocytes',
              color: '#000',
              children: [
                new HSetsNode({
                  name: 'Oligodendrocyte Mature', color: '#000', set: [],
                }),
              ],
            }),
            new HSetsNode({
              name: 'Inhibitory neurons',
              color: '#000',
              children: [
                new HSetsNode({
                  name: 'Inhibitory Pthlh', color: '#000', set: [],
                }),
                new HSetsNode({
                  name: 'Inhibitory Kcnip2', color: '#000', set: [],
                }),
                new HSetsNode({
                  name: 'Inhibitory CP', color: '#000', set: [],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    this.tabRoots = [this.root];
  }
}

export type SetsTreeNodeLeaf = {
  name: string;
  color?: number[];
  set: Array<[string, number | null]>;
}

export type SetsTreeNodeNonLeaf = {
  name: string;
  color?: number[];
  children: Array<SetsTreeNodeNonLeaf | SetsTreeNodeLeaf>;
};

export type SetsTree = {
  version: '0.1.3';
  tree: SetsTreeNodeNonLeaf[];
};

import { z } from 'zod';

export const coordinationTypeName = z.string();
export const coordinationScopeName = z.string();

const stringOrStringArray = z.union([
  z.string(),
  z.array(z.string()),
]);

const oneOrMoreCoordinationScopeNames = stringOrStringArray;

export const componentCoordinationScopes = z.record(
  coordinationTypeName,
  oneOrMoreCoordinationScopeNames,
);

export const componentCoordinationScopesBy = z.record(
  coordinationTypeName,
  z.record(
    coordinationTypeName,
    z.record(coordinationScopeName, oneOrMoreCoordinationScopeNames),
  ),
);

export const rgbArray = z.array(z.number())
  .length(3);

const treeNodeBase = z.object({
  name: z.string(),
  color: rgbArray.optional(),
});

const treeNodeLeaf = treeNodeBase.extend({
  set: z.array(z.string()),
});

type TreeNodeLeaf = z.input<typeof treeNodeLeaf>;

type TreeNodeNonLeaf = z.input<typeof treeNodeBase> & {
  children: Array<TreeNodeNonLeaf | TreeNodeLeaf>;
};

const treeNodeNonLeaf: z.ZodType<TreeNodeNonLeaf> = treeNodeBase.extend({
  children: z.lazy(() => z.array(z.union([treeNodeNonLeaf, treeNodeLeaf]))),
});

const cellSets2 = z.object({
  version: z.literal('0.1.2'),
  tree: z.array(treeNodeNonLeaf),
});

const treeNodeLeafProbabilistic = treeNodeBase.extend({
  set: z.array(z.tuple([z.string(), z.number().nullable()])),
});

type TreeNodeLeafProbabilistic = z.infer<typeof treeNodeLeafProbabilistic>;

type TreeNodeNonLeafProbabilistic = (z.infer<typeof treeNodeBase> & {
  children: Array<TreeNodeNonLeafProbabilistic | TreeNodeLeafProbabilistic>;
});

const treeNodeNonLeafProbabilistic: z.ZodType<TreeNodeNonLeafProbabilistic> = treeNodeBase
  .extend({
    children: z.lazy(() => z.array(
      z.union([treeNodeNonLeafProbabilistic, treeNodeLeafProbabilistic]),
    )),
  });

const cellSets3 = z.object({
  version: z.literal('0.1.3'),
  tree: z.array(treeNodeNonLeafProbabilistic),
});

type TreeNode =
  TreeNodeLeaf
  | TreeNodeNonLeaf
  | TreeNodeLeafProbabilistic
  | TreeNodeNonLeafProbabilistic;

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
export function nodeTransform(
  node: TreeNode,
  predicate: (a: TreeNode, b?: any) => boolean,
  transform: (a: any, b?: any) => any,
  transformedPaths: Array<string[]>,
  currPath: string[] | null = null,
): TreeNode {
  let newPath: string[];
  if (!currPath) {
    newPath = [node.name];
  } else {
    newPath = [...currPath];
  }
  if (predicate(node, newPath)) {
    transformedPaths.push(newPath);
    return transform(node, newPath);
  }
  if ('children' in node) {
    return {
      ...node,
      children: node.children.map((child: TreeNode): TreeNode => nodeTransform(
        child, predicate, transform, transformedPaths, newPath.concat([child.name]),
      )),
    } as TreeNodeNonLeafProbabilistic;
  }
  return node;
}

export const obsSetsSchema = z.union([cellSets3, cellSets2])
  .transform((v): z.infer<typeof cellSets3> => {
    if (v.version === '0.1.3') return v;
    // To upgrade from cell-sets schema 0.1.2 to 0.1.3,
    // add a confidence value of null for each cell ID.
    return {
      ...v,
      version: '0.1.3',
      tree: v.tree.map(levelZeroNode => nodeTransform(
        levelZeroNode,
        (n: TreeNode) => !('children' in n) && Array.isArray(n.set),
        (n: TreeNodeLeaf) => ({ ...n, set: n.set.map((itemId: string) => ([itemId, null])) }),
        [],
      ) as TreeNodeNonLeafProbabilistic),
    };
  });

export const obsSetsTabularSchema = z.array(z.object({
  groupName: z.string(),
  setName: z.string(),
  setColor: rgbArray.optional(),
  obsId: z.string(),
  predictionScore: z.number().nullable().optional(),
}));

export const obsSetPath = z.array(z.string());

export const requestInit = z.object({
  method: z.string().optional(),
  headers: z.record(z.any()).optional(),
  body: z.string().optional(),
  mode: z.string().optional(),
  credentials: z.string().optional(),
  cache: z.string().optional(),
  redirect: z.string().optional(),
  referrer: z.string().optional(),
  integrity: z.string().optional(),
});

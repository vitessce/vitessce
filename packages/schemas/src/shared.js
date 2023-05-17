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

/** @typedef {import('zod').z.input<typeof treeNodeLeaf>} TreeNodeLeaf */
/** @typedef {import('zod').z.input<typeof treeNodeBase> & { children: Array<TreeNodeNonLeaf | TreeNodeLeaf> }} TreeNodeNonLeaf */

/** @type {import('zod').z.ZodType<TreeNodeNonLeaf>} */
const treeNodeNonLeaf = treeNodeBase.extend({
  children: z.lazy(() => z.array(z.union([treeNodeNonLeaf, treeNodeLeaf]))),
});

const cellSets2 = z.object({
  version: z.literal('0.1.2'),
  tree: z.array(treeNodeNonLeaf),
});

const treeNodeLeafProbabilistic = treeNodeBase.extend({
  set: z.array(z.tuple([z.string(), z.number().nullable()])),
});

/** @typedef {import('zod').z.infer<typeof treeNodeLeafProbabilistic>} TreeNodeLeafProbabilistic */
/** @typedef {import('zod').z.infer<typeof treeNodeBase> & { children: Array<TreeNodeNonLeafProbabilistic | TreeNodeLeafProbabilistic> }} TreeNodeNonLeafProbabilistic */

/** @type {import('zod').z.ZodType<TreeNodeNonLeafProbabilistic>} */
const treeNodeNonLeafProbabilistic = treeNodeBase
  .extend({
    children: z.lazy(() => z.array(
      z.union([treeNodeNonLeafProbabilistic, treeNodeLeafProbabilistic]),
    )),
  });

const cellSets3 = z.object({
  version: z.literal('0.1.3'),
  tree: z.array(treeNodeNonLeafProbabilistic),
});

/** @typedef {TreeNodeLeaf | TreeNodeNonLeaf | TreeNodeLeafProbabilistic | TreeNodeNonLeafProbabilistic} TreeNode */

/**
 * Transform a node object using a transform function.
 * @param {TreeNode} node A node object.
 * @param {(a: TreeNode, b?: any) => boolean} predicate Returns true if a node matches a condition of interest.
 * @param {(a: any, b?: any) => any} transform Takes the node matching the predicate as input, returns
 * a transformed version of the node.
 * @param {Array<string[]>} transformedPaths This array parameter is mutated. The path of
 * each transformed node is appended to this array.
 * @param {string[] | null} [currPath=null] The current path of the node being updated, used internally
 * during recursion.
 * @returns {TreeNode} The updated node.
 */
export function nodeTransform(
  node,
  predicate,
  transform,
  transformedPaths,
  currPath = null,
) {
  /** @type {string[]} */
  let newPath;
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
    return /** @type {TreeNodeNonLeafProbabilistic} */ ({
      ...node,
      children: node.children.map(
        /**
         * 
         * @param {TreeNode} child 
         * @returns {TreeNode}
         */
        (child) => nodeTransform(
          child, predicate, transform, transformedPaths, newPath.concat([child.name]),
        )
      ),
    });
  }
  return node;
}

export const obsSetsSchema = z.union([cellSets3, cellSets2])
  .transform(
    /**
     * @param v 
     * @returns {import('zod').z.infer<typeof cellSets3>}
     */
    (v) => {
    if (v.version === '0.1.3') return v;
    // To upgrade from cell-sets schema 0.1.2 to 0.1.3,
    // add a confidence value of null for each cell ID.
    return {
      ...v,
      version: '0.1.3',
      tree: v.tree.map(levelZeroNode => /** @type {TreeNodeNonLeafProbabilistic} */ (nodeTransform(
        levelZeroNode,
        /**
         * @param {TreeNode} n 
         * @returns 
         */
        (n) => !('children' in n) && Array.isArray(n.set),
        /**
         * @param {TreeNodeLeaf} n 
         * @returns 
         */
        (n) => ({ ...n, set: n.set.map(
          /**
           * @param {string} itemId 
           * @returns 
           */
          (itemId) => ([itemId, null])
        ) }),
        [],
      ))),
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

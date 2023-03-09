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

export const colorArray = z.array(z.number())
  .min(3)
  .max(3);

const treeNodeBase = z.object({
  name: z.string(),
  color: colorArray.optional(),
});

const treeNodeLeaf = treeNodeBase.extend({
  set: z.array(z.string()),
});

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

const treeNodeNonLeafProbabilistic = treeNodeBase.extend({
  children: z.lazy(() => z.array(
    z.union([treeNodeNonLeafProbabilistic, treeNodeLeafProbabilistic]),
  )),
});

const cellSets3 = z.object({
  version: z.literal('0.1.3'),
  tree: z.array(treeNodeNonLeafProbabilistic),
});

export const cellSets = z.union([cellSets2, cellSets3]);

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

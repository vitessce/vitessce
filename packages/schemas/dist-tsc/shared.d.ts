import { z } from 'zod';
export declare const coordinationTypeName: z.ZodString;
export declare const coordinationScopeName: z.ZodString;
export declare const componentCoordinationScopes: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
export declare const componentCoordinationScopesBy: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>>>;
export declare const rgbArray: z.ZodArray<z.ZodNumber, "many">;
declare const treeNodeBase: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    color?: number[] | undefined;
}, {
    name: string;
    color?: number[] | undefined;
}>;
declare const treeNodeLeaf: z.ZodObject<z.objectUtil.extendShape<{
    name: z.ZodString;
    color: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, {
    set: z.ZodArray<z.ZodString, "many">;
}>, "strip", z.ZodTypeAny, {
    set: string[];
    name: string;
    color?: number[] | undefined;
}, {
    set: string[];
    name: string;
    color?: number[] | undefined;
}>;
type TreeNodeLeaf = z.input<typeof treeNodeLeaf>;
type TreeNodeNonLeaf = z.input<typeof treeNodeBase> & {
    children: Array<TreeNodeNonLeaf | TreeNodeLeaf>;
};
declare const treeNodeLeafProbabilistic: z.ZodObject<z.objectUtil.extendShape<{
    name: z.ZodString;
    color: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, {
    set: z.ZodArray<z.ZodTuple<[z.ZodString, z.ZodNullable<z.ZodNumber>], null>, "many">;
}>, "strip", z.ZodTypeAny, {
    set: [string, number | null][];
    name: string;
    color?: number[] | undefined;
}, {
    set: [string, number | null][];
    name: string;
    color?: number[] | undefined;
}>;
type TreeNodeLeafProbabilistic = z.infer<typeof treeNodeLeafProbabilistic>;
type TreeNodeNonLeafProbabilistic = (z.infer<typeof treeNodeBase> & {
    children: Array<TreeNodeNonLeafProbabilistic | TreeNodeLeafProbabilistic>;
});
type TreeNode = TreeNodeLeaf | TreeNodeNonLeaf | TreeNodeLeafProbabilistic | TreeNodeNonLeafProbabilistic;
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
export declare function nodeTransform(node: TreeNode, predicate: (a: TreeNode, b?: any) => boolean, transform: (a: any, b?: any) => any, transformedPaths: Array<string[]>, currPath?: string[] | null): TreeNode;
export declare const obsSetsSchema: z.ZodEffects<z.ZodUnion<[z.ZodObject<{
    version: z.ZodLiteral<"0.1.3">;
    tree: z.ZodArray<z.ZodType<TreeNodeNonLeafProbabilistic, z.ZodTypeDef, TreeNodeNonLeafProbabilistic>, "many">;
}, "strip", z.ZodTypeAny, {
    version: "0.1.3";
    tree: TreeNodeNonLeafProbabilistic[];
}, {
    version: "0.1.3";
    tree: TreeNodeNonLeafProbabilistic[];
}>, z.ZodObject<{
    version: z.ZodLiteral<"0.1.2">;
    tree: z.ZodArray<z.ZodType<TreeNodeNonLeaf, z.ZodTypeDef, TreeNodeNonLeaf>, "many">;
}, "strip", z.ZodTypeAny, {
    version: "0.1.2";
    tree: TreeNodeNonLeaf[];
}, {
    version: "0.1.2";
    tree: TreeNodeNonLeaf[];
}>]>, {
    version: "0.1.3";
    tree: TreeNodeNonLeafProbabilistic[];
}, {
    version: "0.1.2";
    tree: TreeNodeNonLeaf[];
} | {
    version: "0.1.3";
    tree: TreeNodeNonLeafProbabilistic[];
}>;
export declare const obsSetsTabularSchema: z.ZodArray<z.ZodObject<{
    groupName: z.ZodString;
    setName: z.ZodString;
    setColor: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    obsId: z.ZodString;
    predictionScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    groupName: string;
    setName: string;
    obsId: string;
    setColor?: number[] | undefined;
    predictionScore?: number | null | undefined;
}, {
    groupName: string;
    setName: string;
    obsId: string;
    setColor?: number[] | undefined;
    predictionScore?: number | null | undefined;
}>, "many">;
export declare const obsSetPath: z.ZodArray<z.ZodString, "many">;
export declare const requestInit: z.ZodObject<{
    method: z.ZodOptional<z.ZodString>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    body: z.ZodOptional<z.ZodString>;
    mode: z.ZodOptional<z.ZodString>;
    credentials: z.ZodOptional<z.ZodString>;
    cache: z.ZodOptional<z.ZodString>;
    redirect: z.ZodOptional<z.ZodString>;
    referrer: z.ZodOptional<z.ZodString>;
    integrity: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    method?: string | undefined;
    headers?: Record<string, any> | undefined;
    body?: string | undefined;
    mode?: string | undefined;
    credentials?: string | undefined;
    cache?: string | undefined;
    redirect?: string | undefined;
    referrer?: string | undefined;
    integrity?: string | undefined;
}, {
    method?: string | undefined;
    headers?: Record<string, any> | undefined;
    body?: string | undefined;
    mode?: string | undefined;
    credentials?: string | undefined;
    cache?: string | undefined;
    redirect?: string | undefined;
    referrer?: string | undefined;
    integrity?: string | undefined;
}>;
export {};
//# sourceMappingURL=shared.d.ts.map
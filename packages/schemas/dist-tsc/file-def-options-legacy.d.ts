export const cellsJsonSchema: z.ZodOptional<z.ZodObject<{
    obsLabelsTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    embeddingTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    obsLabelsTypes?: string[] | undefined;
    embeddingTypes?: string[] | undefined;
}, {
    obsLabelsTypes?: string[] | undefined;
    embeddingTypes?: string[] | undefined;
}>>;
export const anndataCellsZarrSchema: z.ZodObject<{
    xy: z.ZodOptional<z.ZodString>;
    poly: z.ZodOptional<z.ZodString>;
    factors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    mappings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        key: z.ZodString;
        dims: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        key: string;
        dims: number[];
    }, {
        key: string;
        dims: number[];
    }>>>;
}, "strip", z.ZodTypeAny, {
    xy?: string | undefined;
    poly?: string | undefined;
    factors?: string[] | undefined;
    mappings?: Record<string, {
        key: string;
        dims: number[];
    }> | undefined;
}, {
    xy?: string | undefined;
    poly?: string | undefined;
    factors?: string[] | undefined;
    mappings?: Record<string, {
        key: string;
        dims: number[];
    }> | undefined;
}>;
export const anndataCellSetsZarrSchema: z.ZodArray<z.ZodObject<{
    groupName: z.ZodString;
    setName: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    scoreName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    groupName: string;
    setName: string | string[];
    scoreName?: string | undefined;
}, {
    groupName: string;
    setName: string | string[];
    scoreName?: string | undefined;
}>, "many">;
export const anndataExpressionMatrixZarrSchema: z.ZodObject<{
    matrix: z.ZodString;
    geneFilter: z.ZodOptional<z.ZodString>;
    matrixGeneFilter: z.ZodOptional<z.ZodString>;
    geneAlias: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    matrix: string;
    geneFilter?: string | undefined;
    matrixGeneFilter?: string | undefined;
    geneAlias?: string | undefined;
}, {
    matrix: string;
    geneFilter?: string | undefined;
    matrixGeneFilter?: string | undefined;
    geneAlias?: string | undefined;
}>;
import { z } from 'zod';
//# sourceMappingURL=file-def-options-legacy.d.ts.map
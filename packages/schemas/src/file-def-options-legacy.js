import { z } from 'zod';

export const cellsJsonSchema = z.object({
  obsLabelsTypes: z.array(z.string()).optional(),
  embeddingTypes: z.array(z.string()).optional(),
}).optional();

export const anndataCellsZarrSchema = z.object({
  xy: z.string().optional(),
  poly: z.string().optional(),
  factors: z.array(z.string()).optional(),
  mappings: z.record(
    z.object({
      key: z.string(),
      dims: z.array(z.number()).length(2),
    }),
  ).optional(),
});

export const anndataCellSetsZarrSchema = z.array(z.object({
  groupName: z.string(),
  setName: z.union([
    z.string(),
    z.array(z.string()),
  ]),
  scoreName: z.string().optional(),
}));

export const anndataExpressionMatrixZarrSchema = z.object({
  matrix: z.string(),
  geneFilter: z.string().optional(),
  matrixGeneFilter: z.string().optional(),
  geneAlias: z.string().optional(),
});

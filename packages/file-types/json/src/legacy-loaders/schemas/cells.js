import { z } from 'zod';

const coordSchema = z.array(z.number()).length(2);

export const cellsSchema = z.record(
  z.object({
    xy: coordSchema,
    genes: z.record(z.number()),
    factors: z.record(z.string()),
    poly: z.array(coordSchema),
    mappings: z.record(coordSchema),
  }).strict().partial(),
);

import { z } from 'zod';

export const neighborhoodsSchema = z.record(
  z.object({
    poly: z.array(
      // Coordinate
      z.array(z.number()).length(2),
    ),
  }).strict(),
);

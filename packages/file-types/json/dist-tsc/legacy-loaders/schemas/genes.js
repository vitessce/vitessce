import { z } from 'zod';
export const genesSchema = z.record(z.object({
    max: z.number(),
    cells: z.record(z.number()),
}));

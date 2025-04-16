import { z } from 'zod';
export const clustersSchema = z.object({
    rows: z.array(z.string()),
    cols: z.array(z.string()),
    matrix: z.array(z.array(z.number())),
}).strict();

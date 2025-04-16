export const genesSchema: z.ZodRecord<z.ZodString, z.ZodObject<{
    max: z.ZodNumber;
    cells: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    max: number;
    cells: Record<string, number>;
}, {
    max: number;
    cells: Record<string, number>;
}>>;
import { z } from 'zod';
//# sourceMappingURL=genes.d.ts.map
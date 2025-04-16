export const neighborhoodsSchema: z.ZodRecord<z.ZodString, z.ZodObject<{
    poly: z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">;
}, "strict", z.ZodTypeAny, {
    poly: number[][];
}, {
    poly: number[][];
}>>;
import { z } from 'zod';
//# sourceMappingURL=neighborhoods.d.ts.map
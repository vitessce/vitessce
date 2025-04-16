export const clustersSchema: z.ZodObject<{
    rows: z.ZodArray<z.ZodString, "many">;
    cols: z.ZodArray<z.ZodString, "many">;
    matrix: z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">;
}, "strict", z.ZodTypeAny, {
    rows: string[];
    cols: string[];
    matrix: number[][];
}, {
    rows: string[];
    cols: string[];
    matrix: number[][];
}>;
import { z } from 'zod';
//# sourceMappingURL=clusters.d.ts.map
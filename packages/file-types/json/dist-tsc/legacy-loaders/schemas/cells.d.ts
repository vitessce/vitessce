export const cellsSchema: z.ZodRecord<z.ZodString, z.ZodObject<{
    xy: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    genes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    factors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    poly: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">>;
    mappings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodNumber, "many">>>;
}, "strict", z.ZodTypeAny, {
    xy?: number[] | undefined;
    genes?: Record<string, number> | undefined;
    factors?: Record<string, string> | undefined;
    poly?: number[][] | undefined;
    mappings?: Record<string, number[]> | undefined;
}, {
    xy?: number[] | undefined;
    genes?: Record<string, number> | undefined;
    factors?: Record<string, string> | undefined;
    poly?: number[][] | undefined;
    mappings?: Record<string, number[]> | undefined;
}>>;
import { z } from 'zod';
//# sourceMappingURL=cells.d.ts.map
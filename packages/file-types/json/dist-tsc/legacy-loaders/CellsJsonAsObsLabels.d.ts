export default class CellsJsonAsObsLabelsLoader extends JsonLoader {
    schema: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
        xy: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber, "many">>;
        genes: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodNumber>>;
        factors: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodString>>;
        poly: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodArray<import("zod").ZodNumber, "many">, "many">>;
        mappings: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodArray<import("zod").ZodNumber, "many">>>;
    }, "strict", import("zod").ZodTypeAny, {
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
    loadFromCache(data: any): {
        obsIndex: string[];
        obsLabels: any[];
    };
    cachedResult: {
        obsIndex: string[];
        obsLabels: any[];
    } | undefined;
    load(): Promise<any>;
}
import JsonLoader from '../json-loaders/JsonLoader.js';
//# sourceMappingURL=CellsJsonAsObsLabels.d.ts.map
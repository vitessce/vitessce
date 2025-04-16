export default class GenesJsonAsObsFeatureMatrixLoader extends JsonLoader {
    schema: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
        max: import("zod").ZodNumber;
        cells: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodNumber>;
    }, "strip", import("zod").ZodTypeAny, {
        max: number;
        cells: Record<string, number>;
    }, {
        max: number;
        cells: Record<string, number>;
    }>>;
    loadFromCache(data: any): {
        obsIndex: string[];
        featureIndex: string[];
        obsFeatureMatrix: {
            data: Uint8Array;
        };
    };
    cachedResult: {
        obsIndex: string[];
        featureIndex: string[];
        obsFeatureMatrix: {
            data: Uint8Array;
        };
    } | undefined;
    load(): Promise<any>;
}
import JsonLoader from '../json-loaders/JsonLoader.js';
//# sourceMappingURL=GenesJsonAsObsFeatureMatrix.d.ts.map
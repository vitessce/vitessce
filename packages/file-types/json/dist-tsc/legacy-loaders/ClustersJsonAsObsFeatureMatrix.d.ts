export default class ClustersJsonAsObsFeatureMatrixLoader extends JsonLoader {
    schema: import("zod").ZodObject<{
        rows: import("zod").ZodArray<import("zod").ZodString, "many">;
        cols: import("zod").ZodArray<import("zod").ZodString, "many">;
        matrix: import("zod").ZodArray<import("zod").ZodArray<import("zod").ZodNumber, "many">, "many">;
    }, "strict", import("zod").ZodTypeAny, {
        rows: string[];
        cols: string[];
        matrix: number[][];
    }, {
        rows: string[];
        cols: string[];
        matrix: number[][];
    }>;
    loadFromCache(data: any): {
        obsIndex: any;
        featureIndex: any;
        obsFeatureMatrix: {
            data: Uint8Array;
        };
    };
    cachedResult: {
        obsIndex: any;
        featureIndex: any;
        obsFeatureMatrix: {
            data: Uint8Array;
        };
    } | undefined;
    load(): Promise<any>;
}
import JsonLoader from '../json-loaders/JsonLoader.js';
//# sourceMappingURL=ClustersJsonAsObsFeatureMatrix.d.ts.map
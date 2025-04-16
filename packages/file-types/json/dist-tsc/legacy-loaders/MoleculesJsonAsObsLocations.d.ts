export default class MoleculesJsonAsObsLocationsLoader extends JsonLoader {
    schema: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodArray<import("zod").ZodArray<import("zod").ZodNumber, "many">, "many">>;
    loadFromCache(data: any): {
        obsIndex: any;
        obsLocations: {
            data: Float32Array[];
            shape: number[];
        };
    };
    cachedResult: {
        obsIndex: any;
        obsLocations: {
            data: Float32Array[];
            shape: number[];
        };
    } | undefined;
    load(): Promise<any>;
}
import JsonLoader from '../json-loaders/JsonLoader.js';
//# sourceMappingURL=MoleculesJsonAsObsLocations.d.ts.map
export default class MoleculesJsonAsObsLabelsLoader extends JsonLoader {
    schema: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodArray<import("zod").ZodArray<import("zod").ZodNumber, "many">, "many">>;
    loadFromCache(data: any): {
        obsIndex: any;
        obsLabels: any[];
    };
    cachedResult: {
        obsIndex: any;
        obsLabels: any[];
    } | undefined;
    load(): Promise<any>;
}
import JsonLoader from '../json-loaders/JsonLoader.js';
//# sourceMappingURL=MoleculesJsonAsObsLabels.d.ts.map
export default class ObsSegmentationsJsonLoader extends JsonLoader {
    loadFromCache(data: any): {
        obsIndex: string[];
        obsSegmentations: {
            data: any[];
            shape: any[];
        };
        obsSegmentationsType: string;
    };
    cachedResult: {
        obsIndex: string[];
        obsSegmentations: {
            data: any[];
            shape: any[];
        };
        obsSegmentationsType: string;
    } | undefined;
    load(): Promise<any>;
}
import JsonLoader from './JsonLoader.js';
//# sourceMappingURL=ObsSegmentationsJson.d.ts.map
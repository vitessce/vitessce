export default class ObsLocationsCsvLoader extends CsvLoader {
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
}
import CsvLoader from './CsvLoader.js';
//# sourceMappingURL=ObsLocationsCsv.d.ts.map
export default class ObsSpotsCsvLoader extends CsvLoader {
    loadFromCache(data: any): {
        obsIndex: any;
        obsSpots: {
            data: Float32Array[];
            shape: number[];
        };
    };
    cachedResult: {
        obsIndex: any;
        obsSpots: {
            data: Float32Array[];
            shape: number[];
        };
    } | undefined;
}
import CsvLoader from './CsvLoader.js';
//# sourceMappingURL=ObsSpotsCsv.d.ts.map
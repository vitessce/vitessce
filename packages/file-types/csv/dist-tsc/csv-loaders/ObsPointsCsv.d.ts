export default class ObsPointsCsvLoader extends CsvLoader {
    loadFromCache(data: any): {
        obsIndex: any;
        obsPoints: {
            data: Float32Array[];
            shape: number[];
        };
    };
    cachedResult: {
        obsIndex: any;
        obsPoints: {
            data: Float32Array[];
            shape: number[];
        };
    } | undefined;
}
import CsvLoader from './CsvLoader.js';
//# sourceMappingURL=ObsPointsCsv.d.ts.map
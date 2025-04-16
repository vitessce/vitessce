export default class ObsFeatureMatrixCsvLoader extends CsvLoader {
    loadFromCache(data: any): {
        obsIndex: any;
        featureIndex: any[];
        obsFeatureMatrix: {
            data: Float32Array;
        };
    };
    cachedResult: {
        obsIndex: any;
        featureIndex: any[];
        obsFeatureMatrix: {
            data: Float32Array;
        };
    } | undefined;
}
import CsvLoader from './CsvLoader.js';
//# sourceMappingURL=ObsFeatureMatrixCsv.d.ts.map
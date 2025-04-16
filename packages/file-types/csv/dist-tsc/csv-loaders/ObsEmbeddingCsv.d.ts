export default class ObsEmbeddingCsvLoader extends CsvLoader {
    loadFromCache(data: any): {
        obsIndex: any;
        obsEmbedding: {
            data: Float32Array[];
            shape: number[];
        };
    };
    cachedResult: {
        obsIndex: any;
        obsEmbedding: {
            data: Float32Array[];
            shape: number[];
        };
    } | undefined;
}
import CsvLoader from './CsvLoader.js';
//# sourceMappingURL=ObsEmbeddingCsv.d.ts.map
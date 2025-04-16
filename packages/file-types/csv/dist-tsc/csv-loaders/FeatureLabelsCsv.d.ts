export default class FeatureLabelsCsvLoader extends CsvLoader {
    loadFromCache(data: any): {
        featureIndex: any;
        featureLabels: any;
    };
    cachedResult: {
        featureIndex: any;
        featureLabels: any;
    } | undefined;
}
import CsvLoader from './CsvLoader.js';
//# sourceMappingURL=FeatureLabelsCsv.d.ts.map
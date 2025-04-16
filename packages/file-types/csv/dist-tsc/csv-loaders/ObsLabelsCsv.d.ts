export default class ObsLabelsCsvLoader extends CsvLoader {
    loadFromCache(data: any): {
        obsIndex: any;
        obsLabels: any;
    };
    cachedResult: {
        obsIndex: any;
        obsLabels: any;
    } | undefined;
}
import CsvLoader from './CsvLoader.js';
//# sourceMappingURL=ObsLabelsCsv.d.ts.map
import CsvLoader from './CsvLoader.js';
export default class FeatureLabelsCsvLoader extends CsvLoader {
    loadFromCache(data) {
        if (this.cachedResult) {
            return this.cachedResult;
        }
        const { featureIndex: indexCol, featureLabels: labelCol } = this.options;
        const featureIndex = data.map(d => String(d[indexCol]));
        const featureLabels = data.map(d => String(d[labelCol]));
        this.cachedResult = { featureIndex, featureLabels };
        return this.cachedResult;
    }
}

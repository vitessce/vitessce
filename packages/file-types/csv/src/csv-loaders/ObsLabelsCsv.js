import CsvLoader from './CsvLoader.js';

export default class ObsLabelsCsvLoader extends CsvLoader {
  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const { obsIndex: indexCol, obsLabels: labelCol } = this.options;
    const obsIndex = data.map(d => String(d[indexCol]));
    const obsLabels = data.map(d => String(d[labelCol]));
    this.cachedResult = { obsIndex, obsLabels };
    return this.cachedResult;
  }
}

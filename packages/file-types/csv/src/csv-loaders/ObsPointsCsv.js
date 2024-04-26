import CsvLoader from './CsvLoader.js';

export default class ObsPointsCsvLoader extends CsvLoader {
  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const { obsIndex: indexCol, obsPoints: [xCol, yCol] } = this.options;
    const obsIndex = data.map(d => String(d[indexCol]));
    const obsLocationsX = Float32Array.from(data.map(d => d[xCol]));
    const obsLocationsY = Float32Array.from(data.map(d => d[yCol]));
    const obsPoints = {
      data: [obsLocationsX, obsLocationsY],
      shape: [2, obsLocationsX.length],
    };
    this.cachedResult = { obsIndex, obsPoints };
    return this.cachedResult;
  }
}

import CsvLoader from './CsvLoader.js';

export default class ObsSpotsCsvLoader extends CsvLoader {
  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const { obsIndex: indexCol, obsSpots: [xCol, yCol] } = this.options;
    const obsIndex = data.map(d => String(d[indexCol]));
    const obsLocationsX = Float32Array.from(data.map(d => d[xCol]));
    const obsLocationsY = Float32Array.from(data.map(d => d[yCol]));
    const obsSpots = {
      data: [obsLocationsX, obsLocationsY],
      shape: [2, obsLocationsX.length],
    };
    this.cachedResult = { obsIndex, obsSpots };
    return this.cachedResult;
  }
}

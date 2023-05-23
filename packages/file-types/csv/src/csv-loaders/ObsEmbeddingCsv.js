import CsvLoader from './CsvLoader.js';

export default class ObsEmbeddingCsvLoader extends CsvLoader {
  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const { obsIndex: indexCol, obsEmbedding: [xCol, yCol] } = this.options;
    const obsIndex = data.map(d => String(d[indexCol]));
    const obsEmbeddingX = Float32Array.from(data.map(d => d[xCol]));
    const obsEmbeddingY = Float32Array.from(data.map(d => d[yCol]));
    const obsEmbedding = {
      data: [obsEmbeddingX, obsEmbeddingY],
      shape: [2, obsEmbeddingX.length],
    };
    this.cachedResult = { obsIndex, obsEmbedding };
    return this.cachedResult;
  }
}

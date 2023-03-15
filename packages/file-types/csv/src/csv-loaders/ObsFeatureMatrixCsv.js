import { max } from 'd3-array';
import CsvLoader from './CsvLoader';

export default class ObsFeatureMatrixCsvLoader extends CsvLoader {
  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const obsIndex = data.map(d => String(d[data.columns[0]]));
    const featureIndex = [...data.columns];
    featureIndex.shift(); // Remove first element which is index colname.
    const shape = [obsIndex.length, featureIndex.length];
    const out = new Uint8Array(shape[0] * shape[1]);
    // Normalize by gene. Compute per-gene max.
    const featureMax = featureIndex
      .map(featureId => max(data.map(d => parseFloat(d[featureId]))));
    // Divide each value by gene-specific max.
    data.forEach((row, obsI) => {
      const normalizedRow = featureIndex.map(
        (featureId, featureI) => parseFloat(row[featureId]) / featureMax[featureI] * 255,
      );
      out.set(
        normalizedRow,
        obsI * shape[1],
      );
    });

    const obsFeatureMatrix = { data: out };

    this.cachedResult = { obsIndex, featureIndex, obsFeatureMatrix };
    return this.cachedResult;
  }
}

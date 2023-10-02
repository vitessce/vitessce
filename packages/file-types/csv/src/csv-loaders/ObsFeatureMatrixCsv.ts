import type { ObsFeatureMatrixData } from '@vitessce/types';
import CsvLoader from './CsvLoader.js';

export default class ObsFeatureMatrixCsvLoader extends CsvLoader<
  ObsFeatureMatrixData, undefined
> {
  cachedResult: ObsFeatureMatrixData | undefined;

  async loadFromCache() {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const data = await this.dataSource.getData();
    const obsIndex = data.map(d => String(d[data.columns[0]]));
    const featureIndex = [...data.columns];
    featureIndex.shift(); // Remove first element which is index colname.
    const shape = [obsIndex.length, featureIndex.length];
    const out = new Float32Array(shape[0] * shape[1]);
    data.forEach((row, obsI) => {
      const floatRow = featureIndex.map(
        featureId => parseFloat(row[featureId]),
      );
      out.set(
        floatRow,
        obsI * shape[1],
      );
    });
    const obsFeatureMatrix = { data: out, shape };
    this.cachedResult = { obsIndex, featureIndex, obsFeatureMatrix };
    return this.cachedResult;
  }
}

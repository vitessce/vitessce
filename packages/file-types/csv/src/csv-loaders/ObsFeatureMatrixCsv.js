import { max } from 'd3-array';
import { emptySchema } from '@vitessce/vit-s';
import CsvLoader from './CsvLoader';

export default class ObsFeatureMatrixCsvLoader extends CsvLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.optionsSchema = emptySchema;
  }

  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const obsIndex = data.map(d => String(d[data.columns[0]]));
    const featureIndex = [...data.columns];
    featureIndex.shift(); // Remove first element which is index colname.
    const shape = [obsIndex.length, featureIndex.length];
    const normOut = new Uint8Array(shape[0] * shape[1]);

    const out = new Float32Array(shape[0] * shape[1]);
    // Normalize by gene. Compute per-gene max.
    const featureMax = featureIndex
      .map(featureId => max(data.map(d => parseFloat(d[featureId]))));
    // Divide each value by gene-specific max.
    data.forEach((row, obsI) => {
      const normalizedRow = featureIndex.map(
        (featureId, featureI) => parseFloat(row[featureId]) / featureMax[featureI] * 255,
      );
      const origRow = featureIndex.map(
        featureId => parseFloat(row[featureId]),
      );
      normOut.set(
        normalizedRow,
        obsI * shape[1],
      );
      out.set(
        origRow,
        obsI * shape[1],
      );
    });

    const obsFeatureMatrix = { data: out };
    // TODO: use normalized output only when necessary
    // (e.g., for efficient uploading to WebGL shaders).
    // TODO: update other obsFeatureMatrix loaders to return both original and normalized data.
    const normalizedObsFeatureMatrix = { data: normOut };

    this.cachedResult = {
      obsIndex,
      featureIndex,
      obsFeatureMatrix,
      normalizedObsFeatureMatrix,
    };
    return this.cachedResult;
  }
}

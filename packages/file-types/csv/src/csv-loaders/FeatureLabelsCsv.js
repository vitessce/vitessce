import { featureLabelsCsvSchema } from '@vitessce/vit-s';
import CsvLoader from './CsvLoader';

export default class FeatureLabelsCsvLoader extends CsvLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.optionsSchema = featureLabelsCsvSchema;
  }

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

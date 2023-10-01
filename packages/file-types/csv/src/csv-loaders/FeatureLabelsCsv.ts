import type { FeatureLabelsData } from '@vitessce/types';
import type { z, featureLabelsCsvSchema } from '@vitessce/schemas';
import CsvLoader from './CsvLoader.js';

export default class FeatureLabelsCsvLoader extends CsvLoader<FeatureLabelsData, z.infer<typeof featureLabelsCsvSchema>> {

  cachedResult: FeatureLabelsData | undefined;

  async loadFromCache() {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    if(!this.options) throw new Error('options not defined');
    const data = await this.dataSource.getData();
    const { featureIndex: indexCol, featureLabels: labelCol } = this.options;
    const featureIndex = data.map((d: { [key: string]: any }) => String(d[indexCol]));
    const featureLabels = data.map((d: { [key: string]: any }) => String(d[labelCol]));
    this.cachedResult = { featureIndex, featureLabels };
    return this.cachedResult;
  }
}

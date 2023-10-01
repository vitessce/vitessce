import type { ObsLabelsData } from '@vitessce/types';
import type { z, obsLabelsCsvSchema } from '@vitessce/schemas';
import CsvLoader from './CsvLoader.js';

export default class ObsLabelsCsvLoader extends CsvLoader<ObsLabelsData, z.infer<typeof obsLabelsCsvSchema>> {

  cachedResult: ObsLabelsData | undefined;

  async loadFromCache() {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    if(!this.options) throw new Error('options not defined');
    const { obsIndex: indexCol, obsLabels: labelCol } = this.options;
    const data = await this.dataSource.getData();
    const obsIndex = data.map((d: { [key: string]: any }) => String(d[indexCol]));
    const obsLabels = data.map((d: { [key: string]: any }) => String(d[labelCol]));
    this.cachedResult = { obsIndex, obsLabels };
    return this.cachedResult;
  }
}

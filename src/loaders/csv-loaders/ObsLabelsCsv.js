import { obsLabelsCsvSchema } from '../../app/file-options-schemas';
import CsvLoader from './CsvLoader';

export default class ObsLabelsCsvLoader extends CsvLoader {
  constructor(dataSource, params) {
    super(dataSource, params);

    this.optionsSchema = obsLabelsCsvSchema;
  }

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

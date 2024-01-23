import { TwoStepLoader } from '@vitessce/types';
import CsvSource from '../CsvSource.js';

export default abstract class CsvLoader<
  DataType, OptionsType
> extends TwoStepLoader<DataType, CsvSource, OptionsType> {
  // Converts the "raw" data from csvParse into the desired data type.
  abstract loadFromCache(): Promise<DataType>;

  async load() {
    const { url } = this;
    const result = await this.loadFromCache();
    return {
      data: result,
      url,
    };
  }
}

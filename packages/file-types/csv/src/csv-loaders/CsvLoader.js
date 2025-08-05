import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/abstract';

export default class CsvLoader extends AbstractTwoStepLoader {
  async getSourceData() {
    return new LoaderResult(await this.dataSource.loadCsv(), this.url);
  }

  async load() {
    const { data, url } = await this.getSourceData();
    const result = this.loadFromCache(data);
    return new LoaderResult(
      result,
      url,
    );
  }
}

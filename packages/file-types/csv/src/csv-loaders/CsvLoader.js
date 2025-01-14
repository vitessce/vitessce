import { AbstractTwoStepLoader, AbstractLoaderError, LoaderResult } from '@vitessce/abstract';

export default class CsvLoader extends AbstractTwoStepLoader {
  getSourceData() {
    const {
      url,
    } = this;
    if (this.data) {
      return this.data;
    }
    this.data = this.dataSource.data
      .then((data) => {
        if (data instanceof AbstractLoaderError) {
          return Promise.reject(data);
        }
        return Promise.resolve(new LoaderResult(data, url));
      });
    return this.data;
  }

  async load() {
    const payload = await this.getSourceData().catch(reason => Promise.resolve(reason));
    if (payload instanceof AbstractLoaderError) {
      return Promise.reject(payload);
    }
    const { data, url } = payload;
    const result = this.loadFromCache(data);
    return Promise.resolve(new LoaderResult(
      result,
      url,
    ));
  }
}

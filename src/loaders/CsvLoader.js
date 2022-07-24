import AbstractTwoStepLoader from './AbstractTwoStepLoader';
import { AbstractLoaderError } from './errors/index';
import LoaderResult from './LoaderResult';

export default class CsvLoader extends AbstractTwoStepLoader {
  load() {
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
}

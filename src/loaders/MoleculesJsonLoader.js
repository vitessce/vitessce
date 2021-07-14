/* eslint-disable */
import JsonLoader from './JsonLoader';
import { AbstractLoaderError } from './errors/index';
import LoaderResult from './LoaderResult';

export default class MoleculesJsonLoader extends JsonLoader {
  constructor(params) {
    super(params);
  }

  load() {
    const {
      url, type, fileType,
    } = this;
    if (this.data) {
      return this.data;
    }
    this.data = this.loadJson()
      .then((data) => {
        if (data instanceof AbstractLoaderError) {
          return Promise.reject(data);
        }
        console.log(data);
        return Promise.resolve(new LoaderResult(data, url));
      });
    return this.data;
  }
}

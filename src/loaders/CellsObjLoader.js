/* eslint-disable */
import { load } from '@loaders.gl/core';
import { OBJLoader } from '@loaders.gl/obj';
import AbstractTwoStepLoader from './AbstractTwoStepLoader';
import LoaderResult from './LoaderResult';

export default class CellsObjLoader extends AbstractTwoStepLoader {
  load() {
    const {
      url,
    } = this;
    if (this.data) {
      return this.data;
    }
    const objData = load(url, OBJLoader);
    this.data = objData
      .then((data) => {
        console.log(data);
        const cells = {};
        return Promise.resolve(new LoaderResult(cells, url))
      });
    return this.data;
  }
}

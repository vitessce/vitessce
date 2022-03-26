/* eslint-disable */
import { load } from '@loaders.gl/core';
import { GLBLoader } from '@loaders.gl/gltf';
import AbstractTwoStepLoader from './AbstractTwoStepLoader';
import LoaderResult from './LoaderResult';

export default class CellsGlbLoader extends AbstractTwoStepLoader {
  load() {
    const {
      url,
    } = this;
    if (this.data) {
      return this.data;
    }
    const gltfData = load(url, GLBLoader);
    this.data = gltfData.then((data) => {
      console.log(data);
      const cells = {};
      return Promise.resolve(new LoaderResult(cells, url))
    });
    return this.data;
  }
}

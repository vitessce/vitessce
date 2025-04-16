import {
  LoaderResult, AbstractTwoStepLoader, AbstractLoaderError,
} from '@vitessce/abstract';
import { basename } from '../utils.js';

/**
 * Loader for embedding arrays located in anndata.zarr stores.
 */
export default class ObsFeatureColumnsAnndataLoader extends AbstractTwoStepLoader {
  /**
   * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
   * @returns {Promise} A promise for an array of columns.
   */
  async loadObsFeatureColumns() {
    const { options } = this;
    if (this.obsFeatureColumns) {
      return this.obsFeatureColumns;
    }
    if (!this.obsFeatureColumns) {
      const colPaths = options.obsFeatureColumns?.map(({ path }) => path);
      const firstPath = colPaths[0];
      const obsIndex = await this.dataSource.loadObsIndex(firstPath);
      const featureIndex = colPaths.map(colPath => basename(colPath));
      const shape = [obsIndex.length, featureIndex.length];
      const out = new Float32Array(shape[0] * shape[1]);

      const data = await Promise.all(
        colPaths.map(colPath => this.dataSource.loadNumeric(colPath)),
      );
      data.forEach((colData, featureI) => {
        obsIndex.forEach((obsId, obsI) => {
          out[obsI * shape[1] + featureI] = colData.data[obsI];
        });
      });
      const obsFeatureMatrix = { data: out };
      this.obsFeatureColumns = { obsIndex, featureIndex, obsFeatureMatrix };

      return this.obsFeatureColumns;
    }
    this.obsFeatureColumns = Promise.resolve(null);
    return this.obsFeatureColumns;
  }

  async load() {
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }
    return Promise.all([
      this.loadObsFeatureColumns(),
    ]).then(([{ obsIndex, obsFeatureMatrix, featureIndex }]) => Promise
      .resolve(new LoaderResult(
        { obsIndex, obsFeatureMatrix, featureIndex },
        null,
      )));
  }
}

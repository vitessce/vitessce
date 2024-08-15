// @ts-check
import {
  LoaderResult, AbstractTwoStepLoader, AbstractLoaderError,
} from '@vitessce/vit-s';
import { Table, vectorFromArray, makeVector, Utf8 as arrowUtf8 } from 'apache-arrow';


/** @import AnnDataSource from '../AnnDataSource.js' */
/** @import { ObsEmbeddingData, MatrixResult } from '@vitessce/types' */

/**
 * Loader for embedding arrays located in anndata.zarr stores.
 * @template {AnnDataSource} DataSourceType
 * @extends {AbstractTwoStepLoader<DataSourceType>}
 */
export default class ObsEmbeddingAnndataLoader extends AbstractTwoStepLoader {
  /**
   * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
   * @returns {Promise<MatrixResult>} A promise for an array of columns.
   */
  async loadEmbedding() {
    const { path, dims = [0, 1] } = this.options;
    if (this.embedding) {
      return /** @type {Promise<MatrixResult>} */ (this.embedding);
    }
    if (!this.embedding) {
      this.embedding = this.dataSource.loadNumericForDims(path, dims);
      return /** @type {Promise<MatrixResult>} */ (this.embedding);
    }
    return this.embedding;
  }

  /**
   *
   * @returns {Promise<LoaderResult<ObsEmbeddingData>>}
   */
  async load() {
    const { path } = this.options;
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }
    return Promise.all([
      // Pass in the obsEmbedding path,
      // to handle the MuData case where the obsIndex is located at
      // `mod/rna/index` rather than `index`.
      this.dataSource.loadObsIndex(path),
      this.loadEmbedding(),
    ]).then(([obsIndex, obsEmbedding]) => Promise.resolve(new LoaderResult(
      { obsIndex, obsEmbedding },
      null,
    )));
  }

  async loadArrow() {
    const result = await this.load();
    const { obsIndex, obsEmbedding } = result.data;

    return new Table({
      obsIndex: vectorFromArray(obsIndex, new arrowUtf8()),
      x: makeVector(/** @type {Float32Array} */ (obsEmbedding.data[0])),
      y: makeVector(/** @type {Float32Array} */ (obsEmbedding.data[1])),
    });
  }
}

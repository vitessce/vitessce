// @ts-check
import { LoaderResult, AbstractTwoStepLoader } from '@vitessce/abstract';

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
      return /** @type {MatrixResult} */ (this.embedding);
    }
    if (!this.embedding) {
      this.embedding = await this.dataSource.loadNumericForDims(path, dims);
      return /** @type {MatrixResult} */ (this.embedding);
    }
    return this.embedding;
  }

  /**
   *
   * @returns {Promise<LoaderResult<ObsEmbeddingData>>}
   */
  async load() {
    const { path } = this.options;
    const [obsIndex, obsEmbedding] = await Promise.all([
      // Pass in the obsEmbedding path,
      // to handle the MuData case where the obsIndex is located at
      // `mod/rna/index` rather than `index`.
      this.dataSource.loadObsIndex(path),
      this.loadEmbedding(),
    ]);
    return new LoaderResult(
      { obsIndex, obsEmbedding },
      null,
    );
  }
}

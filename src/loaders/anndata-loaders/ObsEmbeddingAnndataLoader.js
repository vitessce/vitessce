import LoaderResult from '../LoaderResult';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';
import { AbstractLoaderError } from '../errors';
import { obsEmbeddingAnndataSchema } from '../../app/file-options-schemas';

/**
 * Loader for embedding arrays located in anndata.zarr stores.
 */
export default class ObsEmbeddingAnndataLoader extends AbstractTwoStepLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
    this.optionsSchema = obsEmbeddingAnndataSchema;
  }

  /**
   * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
   * @returns {Promise} A promise for an array of columns.
   */
  async loadEmbedding() {
    const { path, dims = [0, 1] } = this.options;
    if (this.embedding) {
      return this.embedding;
    }
    if (!this.embedding) {
      this.embedding = await this.dataSource.loadNumericForDims(path, dims);
      return this.embedding;
    }
    this.embedding = Promise.resolve(null);
    return this.embedding;
  }

  async load() {
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }
    return Promise.all([
      this.dataSource.loadObsIndex(),
      this.loadEmbedding(),
    ]).then(([obsIndex, obsEmbedding]) => Promise.resolve(new LoaderResult(
      { obsIndex, obsEmbedding },
      null,
    )));
  }
}

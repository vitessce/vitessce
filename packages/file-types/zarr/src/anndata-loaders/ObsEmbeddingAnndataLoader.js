import {
  LoaderResult, AbstractTwoStepLoader, AbstractLoaderError, obsEmbeddingAnndataSchema,
} from '@vitessce/vit-s';

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
  loadEmbedding() {
    const { path, dims = [0, 1] } = this.options;
    if (this.embedding) {
      return this.embedding;
    }
    if (!this.embedding) {
      this.embedding = this.dataSource.loadNumericForDims(path, dims);
      return this.embedding;
    }
    this.embedding = Promise.resolve(null);
    return this.embedding;
  }

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
}

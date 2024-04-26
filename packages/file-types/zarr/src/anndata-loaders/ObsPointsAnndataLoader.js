import {
  LoaderResult, AbstractTwoStepLoader, AbstractLoaderError,
} from '@vitessce/vit-s';

/**
 * Loader for embedding arrays located in anndata.zarr stores.
 */
export default class ObsPointsAnndataLoader extends AbstractTwoStepLoader {
  /**
   * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
   * @returns {Promise} A promise for an array of columns.
   */
  loadPoints() {
    const { path, dims = [0, 1] } = this.options;
    if (this.locations) {
      return this.locations;
    }
    if (!this.locations) {
      this.locations = this.dataSource.loadNumericForDims(path, dims);
      return this.locations;
    }
    this.locations = Promise.resolve(null);
    return this.locations;
  }

  async load() {
    const { path } = this.options;
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }
    return Promise.all([
      this.dataSource.loadObsIndex(path),
      this.loadPoints(),
    ]).then(([obsIndex, obsPoints]) => Promise.resolve(new LoaderResult(
      { obsIndex, obsPoints },
      null,
    )));
  }
}

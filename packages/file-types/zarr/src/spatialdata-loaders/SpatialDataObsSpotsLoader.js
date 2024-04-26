import {
  LoaderResult, AbstractTwoStepLoader, AbstractLoaderError,
} from '@vitessce/vit-s';

function getCoordsPath(path) {
  return `${path}/coords`;
}

/**
   * Loader for embedding arrays located in anndata.zarr stores.
   */
export default class SpatialDataObsSpotsLoader extends AbstractTwoStepLoader {
  /**
     * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
     * @returns {Promise} A promise for an array of columns.
     */
  loadSpots() {
    const { path, dims = [0, 1] } = this.options;
    if (this.locations) {
      return this.locations;
    }
    if (!this.locations) {
      this.locations = this.dataSource.loadNumericForDims(getCoordsPath(path), dims);
      return this.locations;
    }
    this.locations = Promise.resolve(null);
    return this.locations;
  }

  async load() {
    const { path, tablePath } = this.options;
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }
    return Promise.all([
      this.dataSource.loadObsIndex(getCoordsPath(path), tablePath),
      this.loadSpots(),
    ]).then(([obsIndex, obsSpots]) => Promise.resolve(new LoaderResult(
      { obsIndex, obsSpots },
      null,
    )));
  }
}

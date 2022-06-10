import LoaderResult from '../LoaderResult';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';

/**
 * Loader for embedding arrays located in anndata.zarr stores.
 */
export default class ObsLocationsAnndataLoader extends AbstractTwoStepLoader {
  /**
   * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
   * @returns {Promise} A promise for an array of columns.
   */
  loadLocations() {
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
    return this.loadLocations().then(
      locations => Promise.resolve(new LoaderResult(locations, null)),
    );
  }
}

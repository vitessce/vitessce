import LoaderResult from '../LoaderResult';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';

/**
 * Loader for embedding arrays located in anndata.zarr stores.
 */
export default class ObsSegmentationsAnndataLoader extends AbstractTwoStepLoader {
  /**
   * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
   * @returns {Promise} A promise for an array of columns.
   */
  async loadSegmentations() {
    const { path } = this.options;
    if (this.segmentations) {
      return this.segmentations;
    }
    if (!this.segmentations) {
      this.segmentations = await this.dataSource.loadNumeric(path);
      return this.segmentations;
    }
    this.segmentations = Promise.resolve(null);
    return this.segmentations;
  }

  async load() {
    return Promise.all([
      this.dataSource.loadObsIndex(),
      this.loadSegmentations(),
    ]).then(([obsIndex, obsSegmentations]) => Promise.resolve(new LoaderResult(
      { obsIndex, obsSegmentations },
      null,
    )));
  }
}

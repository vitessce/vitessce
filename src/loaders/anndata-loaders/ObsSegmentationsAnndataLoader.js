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
    const { polygonsPath } = this.options;
    if (this.segmentations) {
      return this.segmentations;
    }
    if (!this.segmentations) {
      this.segmentations = await this.dataSource.loadNumeric(polygonsPath);
      return this.segmentations;
    }
    this.segmentations = Promise.resolve(null);
    return this.segmentations;
  }

  async loadCentroids() {
    const { centroidsPath } = this.options;
    if (this.centroids) {
      return this.centroids;
    }
    if (!this.centroids) {
      this.centroids = await this.dataSource.loadNumericForDims(centroidsPath, [0, 1]);
      return this.centroids;
    }
    this.centroids = Promise.resolve(null);
    return this.centroids;
  }

  async load() {
    return Promise.all([
      this.dataSource.loadObsIndex(),
      this.loadSegmentations(),
      this.loadCentroids(),
    ]).then(([obsIndex, obsSegmentations, obsCentroids]) => Promise.resolve(new LoaderResult(
      {
        obsIndex,
        obsSegmentations,
        obsSegmentationsType: 'polygon',
        obsCentroids,
      },
      null,
    )));
  }
}

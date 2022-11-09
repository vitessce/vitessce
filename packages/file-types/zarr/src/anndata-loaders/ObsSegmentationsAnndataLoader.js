import {
  LoaderResult, AbstractTwoStepLoader, AbstractLoaderError, obsSegmentationsAnndataSchema,
} from '@vitessce/vit-s';
import { DEFAULT_CELLS_LAYER } from '@vitessce/spatial-utils';


/**
 * Loader for embedding arrays located in anndata.zarr stores.
 */
export default class ObsSegmentationsAnndataLoader extends AbstractTwoStepLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
    this.optionsSchema = obsSegmentationsAnndataSchema;
  }

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
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }
    const coordinationValues = {
      spatialSegmentationLayer: DEFAULT_CELLS_LAYER,
    };
    return Promise.all([
      this.dataSource.loadObsIndex(),
      this.loadSegmentations(),
    ]).then(([obsIndex, obsSegmentations]) => Promise.resolve(new LoaderResult(
      {
        obsIndex,
        obsSegmentations,
        obsSegmentationsType: 'polygon',
      },
      coordinationValues,
    )));
  }
}

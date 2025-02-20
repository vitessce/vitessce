import {
  LoaderResult, AbstractTwoStepLoader, AbstractLoaderError,
} from '@vitessce/abstract';
import { CoordinationLevel as CL } from '@vitessce/config';

/**
 * Loader for embedding arrays located in anndata.zarr stores.
 */
export default class ObsSpotsAnndataLoader extends AbstractTwoStepLoader {
  /**
   * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
   * @returns {Promise} A promise for an array of columns.
   */
  async loadSpots() {
    const { path, dims = [0, 1] } = this.options;
    if (this.locations) {
      return this.locations;
    }
    if (!this.locations) {
      this.locations = await this.dataSource.loadNumericForDims(path, dims);
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

    const coordinationValues = {
      spotLayer: CL({
        obsType: 'spot',
        // obsColorEncoding: 'spatialLayerColor',
        // spatialLayerColor: [255, 255, 255],
        spatialLayerVisible: true,
        spatialLayerOpacity: 1.0,
        spatialSpotRadius: 10.0, // TODO: get this from adata.uns if possible.
        // TODO: spatialSpotRadiusUnit: 'µm' or 'um'
        // after resolving https://github.com/vitessce/vitessce/issues/1760
        // featureValueColormapRange: [0, 1],
        // obsHighlight: null,
        // obsSetColor: null,
        // obsSetSelection: null,
        // additionalObsSets: null,
      }),
    };

    return Promise.all([
      this.dataSource.loadObsIndex(path),
      this.loadSpots(),
    ]).then(([obsIndex, obsSpots]) => Promise.resolve(new LoaderResult(
      { obsIndex, obsSpots },
      null,
      coordinationValues,
    )));
  }
}

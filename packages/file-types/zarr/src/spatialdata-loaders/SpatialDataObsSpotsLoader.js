import {
  LoaderResult, AbstractTwoStepLoader, AbstractLoaderError,
} from '@vitessce/vit-s';
import { CoordinationLevel as CL } from '@vitessce/config';

function getCoordsPath(path) {
  return `${path}/coords`;
}

function getRadiusPath(path) {
  return `${path}/radius`;
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

  loadRadius() {
    const { path } = this.options;
    if (this.radius) {
      return this.radius;
    }
    if (!this.radius) {
      this.radius = this.dataSource.loadNumeric(getRadiusPath(path));
      return this.radius;
    }
    this.radius = Promise.resolve(null);
    return this.radius;
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
      this.loadRadius(),
    ]).then(([obsIndex, obsSpots, obsRadius]) => {

      const spatialSpotRadius = obsRadius?.data?.[0];

      const coordinationValues = {
        spotLayer: CL({
          obsType: 'spot',
          // obsColorEncoding: 'spatialLayerColor',
          // spatialLayerColor: [255, 255, 255],
          spatialLayerVisible: true,
          spatialLayerOpacity: 1.0,
          spatialSpotRadius: spatialSpotRadius,
          // TODO: spatialSpotRadiusUnit: 'µm' or 'um'
          // after resolving https://github.com/vitessce/vitessce/issues/1760
          // featureValueColormapRange: [0, 1],
          // obsHighlight: null,
          // obsSetColor: null,
          // obsSetSelection: null,
          // additionalObsSets: null,
        })
      };

      return Promise.resolve(new LoaderResult(
        { obsIndex, obsSpots },
        null,
        coordinationValues,
      ));
    });
  }
}

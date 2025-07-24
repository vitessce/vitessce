import { LoaderResult, AbstractTwoStepLoader } from '@vitessce/abstract';
import { AbstractLoaderError } from '@vitessce/error';
import { CoordinationLevel as CL } from '@vitessce/config';

/**
 * Loader for embedding arrays located in anndata.zarr stores.
 */
export default class ObsPointsAnndataLoader extends AbstractTwoStepLoader {
  /**
   * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
   * @returns {Promise} A promise for an array of columns.
   */
  async loadPoints() {
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
    const coordinationValues = {
      pointLayer: CL({
        obsType: 'point',
        // obsColorEncoding: 'spatialLayerColor',
        // spatialLayerColor: [255, 255, 255],
        spatialLayerVisible: true,
        spatialLayerOpacity: 1.0,
        // TODO: support a point radius?
        // featureValueColormapRange: [0, 1],
        // obsHighlight: null,
        // obsSetColor: null,
        // obsSetSelection: null,
        // additionalObsSets: null,
        // obsLabelsType: null,
      }),
    };
    const [obsIndex, obsPoints] = await Promise.all([
      this.dataSource.loadObsIndex(path),
      this.loadPoints(),
    ]);
    return new LoaderResult(
      { obsIndex, obsPoints },
      null,
      coordinationValues,
    );
  }
}

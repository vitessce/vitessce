import { FeatureLabelsAnndataLoader } from '@vitessce/zarr';

/**
 * Loader for feature labels located in spatialdata.zarr stores.
 */
export default class SpatialDataFeatureLabelsLoader extends FeatureLabelsAnndataLoader {
  constructor(dataSource, params) {
    console.log({ dataSource, params });
    super(dataSource, params);
    this.region = this.options.region;
    this.tablePath = this.options.tablePath;
  }
}

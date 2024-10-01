import ObsSetsAnndataLoader from '../anndata-loaders/ObsSetsAnndataLoader.js';

/**
   * Loader for embedding arrays located in anndata.zarr stores.
   */
export default class SpatialDataObsSetsLoader extends ObsSetsAnndataLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
    this.region = this.options.region;
  }
}

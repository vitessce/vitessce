import { ObsSetsAnndataLoader } from '@vitessce/zarr';

/**
   * Loader for embedding arrays located in anndata.zarr stores.
   */
export default class SpatialDataObsSetsLoader extends ObsSetsAnndataLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
    this.region = this.options.region;
    this.tablePath = this.options.tablePath;
  }
}

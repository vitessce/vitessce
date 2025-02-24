// @ts-check
import { LoaderResult, AbstractTwoStepLoader, AbstractLoaderError } from '@vitessce/abstract';

/** @import AnnDataSource from '../AnnDataSource.js' */
/** @import { ComparisonMetadata } from '@vitessce/types' */

/**
 * Loader for string arrays located in anndata.zarr stores.
 * @template {AnnDataSource} DataSourceType
 * @extends {AbstractTwoStepLoader<DataSourceType>}
 */
export default class ComparisonMetadataAnndataLoader extends AbstractTwoStepLoader {
  /**
   *
   * @returns {Promise<LoaderResult<ComparisonMetadata>>}
   */
  async load() {
    const { path } = this.options;
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }
    const unsString = await this.dataSource._loadElement(`/${path}`);
    const unsObject = JSON.parse(/** @type {any} */ (unsString));

    return Promise.resolve(new LoaderResult(
      {
        // Should a more complex class be wrapping this JSON object to help with downstream querying?
        comparisonMetadata: unsObject
      },
      null,
    ));
  }
}

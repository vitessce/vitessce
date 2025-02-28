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
    // eslint-disable-next-line no-underscore-dangle
    const unsString = await this.dataSource._loadElement(`/${path}`);
    const unsObject = JSON.parse(/** @type {any} */ (unsString));

    if (!(unsObject.schema_version === '0.0.1' || unsObject.schema_version === '0.0.2')) {
      throw new Error('Unsupported comparison_metadata schema version.');
    }

    return Promise.resolve(new LoaderResult(
      {
        // Should a more complex class be wrapping this
        // JSON object to help with downstream querying?
        comparisonMetadata: unsObject,
      },
      null,
    ));
  }
}

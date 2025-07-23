// @ts-check
import { LoaderResult, AbstractTwoStepLoader } from '@vitessce/abstract';
import { AbstractLoaderError } from '@vitessce/error';
import { loadComparisonMetadata } from './comparative-utils.js';

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
    const metadata = await loadComparisonMetadata(this.dataSource, path);
    return Promise.resolve(new LoaderResult(
      {
        // Should a more complex class be wrapping this
        // JSON object to help with downstream querying?
        comparisonMetadata: metadata,
      },
      null,
    ));
  }
}

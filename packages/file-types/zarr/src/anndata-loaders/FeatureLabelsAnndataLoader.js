// @ts-check
import { LoaderResult, AbstractTwoStepLoader, AbstractLoaderError } from '@vitessce/abstract';

/** @import AnnDataSource from '../AnnDataSource.js' */
/** @import { FeatureLabelsData } from '@vitessce/types' */

/**
 * Loader for string arrays located in anndata.zarr stores.
 * @template {AnnDataSource} DataSourceType
 * @extends {AbstractTwoStepLoader<DataSourceType>}
 */
export default class FeatureLabelsAnndataLoader extends AbstractTwoStepLoader {
  /**
   * Class method for loading feature string labels.
   * @returns {Promise<string[]>} A promise for the array.
   */
  async loadLabels() {
    const { path } = this.options;
    if (this.labels) {
      return this.labels;
    }
    if (!this.labels) {
      // eslint-disable-next-line no-underscore-dangle
      this.labels = this.dataSource._loadColumn(path);
      return this.labels;
    }
    return this.labels;
  }

  /**
   *
   * @returns {Promise<LoaderResult<FeatureLabelsData>>}
   */
  async load() {
    const { path } = this.options;
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }
    return Promise.all([
      // Pass in the obsEmbedding path,
      // to handle the MuData case where the obsIndex is located at
      // `mod/rna/index` rather than `index`.
      this.dataSource.loadVarIndex(path),
      this.loadLabels(),
    ]).then(([featureIndex, featureLabels]) => Promise.resolve(new LoaderResult(
      {
        featureIndex,
        featureLabels,
        featureLabelsMap: new Map(featureIndex.map((key, i) => ([key, featureLabels?.[i]]))),
      },
      null,
    )));
  }
}

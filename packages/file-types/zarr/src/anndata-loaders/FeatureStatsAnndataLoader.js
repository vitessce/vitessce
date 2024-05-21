// @ts-check
import { LoaderResult, AbstractTwoStepLoader, AbstractLoaderError } from '@vitessce/vit-s';

/** @import AnnDataSource from '../AnnDataSource.js' */
/** @import { FeatureStatsData } from '@vitessce/types' */

/**
 * Loader for string arrays located in anndata.zarr stores.
 * @template {AnnDataSource} DataSourceType
 * @extends {AbstractTwoStepLoader<DataSourceType>}
 */
export default class FeatureStatsAnndataLoader extends AbstractTwoStepLoader {

  /**
   * Class method for loading feature string labels.
   * @returns {Promise<string[]>} A promise for the array.
   
  async loadFeatureIds() {
    const { path } = this.options;
    if (this.featureIds) {
      return this.labels;
    }
    if (!this.labels) {
      // eslint-disable-next-line no-underscore-dangle
      this.labels = this.dataSource._loadColumn(path);
      return this.labels;
    }
    return this.labels;
  }
  */

  async loadMetadata() {
    const { path } = this.options;
    if (this.metadata) {
      return this.metadata;
    }
    if (!this.metadata) {
      // eslint-disable-next-line no-underscore-dangle
      this.metadata = JSON.parse(await this.dataSource._loadString(path));
      return this.metadata;
    }
    return this.metadata;
  }

  /**
   * Load data from multiple dataframes, merged.
   * @param {object} volcanoOptions
   * @param {string[]|null} [volcanoOptions.sampleFacet]
   * @param {string[]|null} [volcanoOptions.obsSetFacet]
   * @param {number|null} [volcanoOptions.topK]
   * @param {string[][]|null} [volcanoOptions.sampleSetSelection]
   * @returns {Promise<LoaderResult<FeatureStatsData>>}
   */
  async loadMulti(volcanoOptions) {
    const { sampleSetSelection, sampleFacet, obsSetFacet, topK } = volcanoOptions || {};
    // TODO: If faceting, need to load data from multiple dataframes.

    // Construct { minuend, subtrahend } objects to use for matching within uns/diffexp metadata.
    const pairs = [];

    if (sampleSetSelection) {
        if (sampleSetSelection.length !== 2) {
            return Promise.reject(new Error('Expected exactly two sample sets for volcano plot.'));
        }
        const minuend = {
            sampleSet: sampleSetSelection[0].at(-1),
        };
        const subtrahend = {
            sampleSet: sampleSetSelection[1].at(-1),
        };
        pairs.push({ minuend, subtrahend });
    }

    const metadata = await this.loadMetadata();
    console.log(metadata);

    // TODO: match metadata against pairs to get paths to the dataframes.


    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }
    return Promise.all([
      this.loadMetadata(),
    ]).then(([
        /*featureId,
        featureSignificance,
        featureFoldChange,
        sampleId,
        obsSetId,*/
        metadata
    ]) => Promise.resolve(new LoaderResult(
      {
        featureId: [], // TODO: get from then() parameter
        featureSignificance: [], // TODO: get from then() parameter
        featureFoldChange: [], // TODO: get from then() parameter
        sampleId: [], // TODO: get from then() parameter
        obsSetId: [], // TODO: get from then() parameter
      },
      null,
    )));
  }

  /**
   * @returns {Promise<LoaderResult<FeatureStatsData>>}
   */
  async load() {
    // TODO: By default, load data faceted by obsSet.
    return this.loadMulti({
        sampleFacet: null,
        obsSetFacet: null,
        topK: null,
    });
  }
}

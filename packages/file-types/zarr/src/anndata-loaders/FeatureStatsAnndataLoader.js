// @ts-check
import { LoaderResult, AbstractTwoStepLoader, AbstractLoaderError } from '@vitessce/vit-s';

/** @import AnnDataSource from '../AnnDataSource.js' */
/** @import { FeatureStatsData } from '@vitessce/types' */

/**
 * @typedef {object} StatsMeta
 * @property {object} key
 * @property {object} key.minuend
 * @property {object} key.minuend.condition
 * @property {string} key.minuend.condition.type
 * @property {string} key.minuend.condition.path
 * @property {string} key.minuend.condition.value
 * @property {any} key.minuend.filter
 * @property {any} key.minuend.facet
 * @property {object} key.subtrahend
 * @property {object} key.subtrahend.condition
 * @property {string} key.subtrahend.condition.type
 * @property {string} key.subtrahend.condition.path
 * @property {string} key.subtrahend.condition.value
 * @property {any} key.subtrahend.filter
 * @property {any} key.subtrahend.facet
 * @property {string} disordered_var_path
 * @property {string?} diff_layer_path
 * @property {string?} membership_layer_path
 */

/**
 * 
 * @param {StatsMeta[]} metadata 
 * @param {(a: StatsMeta) => boolean} predicate 
 * @returns 
 */
function findSwap(metadata, predicate) {
  const match = metadata.find(predicate);
  if (match) {
    return match;
  }
  return metadata.find((obj) => {
    return predicate({ ...obj, key: { minuend: obj.key.subtrahend, subtrahend: obj.key.minuend } });
  });
}

/**
 * Loader for string arrays located in anndata.zarr stores.
 * @template {AnnDataSource} DataSourceType
 * @extends {AbstractTwoStepLoader<DataSourceType>}
 */
export default class FeatureStatsAnndataLoader extends AbstractTwoStepLoader {

  /**
   * Class method for loading feature string labels.
   * @param {string[]} dfPaths
   * @param {string} colname
   * @returns {Promise<string[]>} A promise for the array.
   */
  async loadAndConcat(dfPaths, colname) {
    // eslint-disable-next-line no-underscore-dangle
    const subArrs = await Promise.all(dfPaths.map(
      dfPath => this.dataSource._loadColumn(`${dfPath}/${colname}`)
    ));
    return subArrs.flat();
  }

  /**
   * Class method for loading feature string labels.
   * @param {string[]} dfPaths
   * @param {string} colname
   * @returns {Promise<number[]>} A promise for the array.
   */
  async loadAndConcatNumeric(dfPaths, colname) {
    // eslint-disable-next-line no-underscore-dangle
    const subArrs = await Promise.all(dfPaths.map(
      dfPath => this.dataSource.loadNumeric(`${dfPath}/${colname}`)
    ));
    // TODO: optimize this. Do not convert TypedArray to Array here.
    return subArrs.map(arr => Array.from(arr.data)).flat();
  }

  /**
   * 
   * @param {string[]} dfPaths
   * @returns {Promise<number[]>}
   */
  async loadFeatureSignificance(dfPaths) {
    return (await this.loadAndConcatNumeric(dfPaths, 'adj_pval'))
      .map((val) => - Math.log10(val));
  }

  /**
   * 
   * @returns {Promise<StatsMeta[]>}
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
    console.log(volcanoOptions);
    const { sampleSetSelection, sampleFacet, obsSetFacet, topK } = volcanoOptions || {};
    // TODO: If faceting, need to load data from multiple dataframes.

    // Construct { minuend, subtrahend } objects to use for matching within uns/diffexp metadata.
    const matchingPaths = [];
    const metadata = await this.loadMetadata();

    if (sampleSetSelection) {
      if (sampleSetSelection.length !== 2) {
          return Promise.reject(new Error('Expected exactly two sample sets for volcano plot.'));
      }
      // Match metadata against to get paths to dataframe(s).
      const match = findSwap(metadata, ({ key: { minuend, subtrahend } }) => {
        return (
          // TODO: get the path to the column based on the sampleSetSelection path?
          // Unclear how to do this as it is an option in the sampleSets loader,
          // but we could alternatively require the user to redundantly provide it as an option to the featureStats loader as well.
          minuend.condition.type === 'sample_set'
          // && minuend.condition.value === sampleSetSelection[0].at(-1)
          && minuend.filter === null
          && minuend.facet === null
          && subtrahend.condition.type === 'sample_set'
          // && subtrahend.condition.value === sampleSetSelection[1].at(-1)
          && subtrahend.filter === null
          && subtrahend.facet === null
        );
      });
      if(match?.disordered_var_path) {
        matchingPaths.push(match.disordered_var_path);
      }
    }
    
    // TODO: extend to support multiple matching paths for faceting
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }
    return Promise.all([
      // TODO: pass topK (if present) to the load functions to limit their amount of requested Zarr chunks.
      this.loadAndConcat(matchingPaths, 'name'),
      this.loadFeatureSignificance(matchingPaths),
      this.loadAndConcatNumeric(matchingPaths, 'lfc'),
    ]).then(([
        featureId,
        featureSignificance,
        featureFoldChange,
        /*sampleId,
        obsSetId,*/
    ]) => Promise.resolve(new LoaderResult(
      {
        featureId,
        featureSignificance,
        featureFoldChange,
        sampleId: null, // TODO: get from then() parameter
        obsSetId: null, // TODO: get from then() parameter
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

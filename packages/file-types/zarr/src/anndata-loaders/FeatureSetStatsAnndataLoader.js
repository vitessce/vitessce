/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { LoaderResult, AbstractTwoStepLoader } from '@vitessce/abstract';
import { getDebugMode } from '@vitessce/globals';
import { isEqual } from 'lodash-es';
import { isEqualPathPair, loadComparisonMetadata } from './comparative-utils.js';

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
   * @returns {Promise<any>} A promise for the array.
   */
  async loadSignificances(dfPath) {
    const { pValueColumn } = this.options;
    // Check the options to determine whether the significance values are pre-transformed
    // or if we still need to compute minus log10 here.
    const values = await this.dataSource.loadNumeric(`${dfPath}/${pValueColumn}`);
    return values.data;
  }

  async loadFeatureSetNames(dfPath) {
    const { indexColumn } = this.options;
    if (indexColumn) {
      return this.dataSource._loadColumn(`${dfPath}/${indexColumn}`);
    }
    // Use the default dataframe index column in this case.
    return this.dataSource.loadDataFrameIndex(dfPath);
  }

  async loadFeatureSetTerms(dfPath) {
    const { termColumn } = this.options;
    return this.dataSource._loadColumn(`${dfPath}/${termColumn}`);
  }

  async loadDataFrame(dfPath) {
    const [
      featureSetName,
      featureSetTerm,
      featureSetSignificance,
    ] = await Promise.all([
      this.loadFeatureSetNames(dfPath),
      this.loadFeatureSetTerms(dfPath),
      this.loadSignificances(dfPath),
    ]);

    // TODO: this is temporary until KPMP data has been re-processed.
    const cleanName = (s) => {
      if (s.includes('R-HSA-')) {
        return s.substring(0, s.indexOf('R-HSA-') - 1);
      }
      return s;
    };
    const cleanTerm = (s) => {
      if (s.includes('R-HSA-')) {
        return `REACTOME:${s.substring(s.indexOf('R-HSA-'))}`;
      }
      return s;
    };
    return {
      featureSetName: featureSetName.map(s => cleanName(s)),
      featureSetTerm: featureSetTerm.map(s => cleanTerm(s)),
      featureSetSignificance,
    };
  }

  /**
   *
   * @returns {Promise<StatsMeta[]>}
   */
  async loadMetadata() {
    const { metadataPath } = this.options;
    if (this.metadata) {
      return this.metadata;
    }
    if (!this.metadata) {
      this.metadata = await loadComparisonMetadata(this.dataSource, metadataPath);
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
    const {
      analysisType: targetAnalysisType = 'pertpy_hypergeometric',
      featureSetLibrary: targetFeatureSetLibrary = 'Reactome_2022',
    } = this.options;
    const { sampleSetSelection, obsSetSelection } = volcanoOptions || {};

    // TODO: should this also depend on a "featureSetType" such as "pathway"
    // or an ontology id/name such as "GO" vs. "CHEMBL"?

    // We expect these set paths to have already been transformed
    // to use the "raw" column names,
    // according to the mappings defined in obsSets and sampleSets loader options.
    // The values in the comparison_metadata have the "raw" column names.
    const rawObsSetSelection = obsSetSelection;
    const rawSampleSetSelection = sampleSetSelection;

    if (sampleSetSelection) {
      if (sampleSetSelection.length !== 2) {
        if (getDebugMode()) {
          return Promise.reject(new Error('Expected exactly two sample sets for volcano plot.'));
        }
        return null;
      }
    }

    if (!obsSetSelection) {
      if (getDebugMode()) {
        return Promise.reject(new Error('Expected obsSetSelection to be present.'));
      }
      return null;
    }

    const metadata = await this.loadMetadata();

    // Match metadata against to get paths to dataframe(s) of interest.
    const matchingComparisons = [];
    Object.values(metadata.comparisons).forEach((comparisonGroupObject) => {
      const { results } = comparisonGroupObject;
      results.forEach((resultObject) => {
        const {
          analysis_type,
          analysis_params,
          coordination_values,
          // path,
        } = resultObject;
        if (
          analysis_type === targetAnalysisType
          && (analysis_params
            ?.pertpy_hypergeometric
            ?.enrichr_library_name === targetFeatureSetLibrary)
        ) {
          // This is a diff. exp. result.
          if (sampleSetSelection) {
            // Comparing two sample groups.
            rawObsSetSelection.forEach((obsSetPath) => {
              if (isEqual([obsSetPath], coordination_values.obsSetFilter)) {
                // The obsSetSelection matches.
                // Now check whether the sampleSetSelection matches.
                if (isEqualPathPair(rawSampleSetSelection, coordination_values.sampleSetFilter)) {
                  matchingComparisons.push(resultObject);
                }
              }
            });
          } else if (obsSetSelection) {
            // Comparing no sample groups but have selected cell type(s) of interest.
            rawObsSetSelection.forEach((obsSetPath) => {
              if (isEqual([obsSetPath], coordination_values.obsSetSelection)) {
                matchingComparisons.push(resultObject);
              }
            });
          }
        }
      });
    });

    // Using this matchingComparisons list,
    // load the relevant columns of each matching dataframe and concatenate them together.
    const result = await Promise.all(matchingComparisons.map(async (comparisonObject) => {
      const df = await this.loadDataFrame(comparisonObject.path);
      return {
        df,
        metadata: comparisonObject,
      };
    }));
    return new LoaderResult({ featureSetStats: result }, null);
  }

  // eslint-disable-next-line class-methods-use-this
  async load() {
    throw new Error('The load() method is not implemented for FeatureSetStatsAnndataLoader.');
  }
}

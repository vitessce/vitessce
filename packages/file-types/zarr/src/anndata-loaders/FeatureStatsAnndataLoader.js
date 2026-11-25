/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { LoaderResult, AbstractTwoStepLoader } from '@vitessce/abstract';
import { getDebugMode, log } from '@vitessce/globals';
import { isEqual } from 'lodash-es';
import { isMatchingSampleSetFilter, loadComparisonMetadata } from './comparative-utils.js';

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
    const { pValueColumn, pValueTransformation } = this.options;
    // Check the options to determine whether the significance values are pre-transformed
    // or if we still need to compute minus log10 here.
    const values = await this.dataSource.loadNumeric(`${dfPath}/${pValueColumn}`);
    if (pValueTransformation === 'minuslog10') {
      // Invert the transformation, to return the plain p-values.
      // The view will do the -Math.log10 transformation if needed.
      values.data = values.data.map(val => (10 ** -val));
    }
    return values.data;
  }

  /**
   * Class method for loading feature string labels.
   * @returns {Promise<any>} A promise for the array.
   */
  async loadFoldChanges(dfPath) {
    const { foldChangeColumn, foldChangeTransformation } = this.options;
    // Check the options to determine whether the significance values are pre-transformed
    // or if we still need to compute log2 here.
    const values = await this.dataSource.loadNumeric(`${dfPath}/${foldChangeColumn}`);
    // Invert the transformation
    if (foldChangeTransformation === 'log2') {
      values.data = values.data.map(val => (2 ** val));
    }
    return values.data;
  }

  async loadFeatureNames(dfPath) {
    const { indexColumn } = this.options;
    if (indexColumn) {
      return this.dataSource._loadColumn(`${dfPath}/${indexColumn}`);
    }
    // Use the default dataframe index column in this case.
    return this.dataSource.loadDataFrameIndex(dfPath);
  }

  /**
   * Load an optional numeric column from the dataframe.
   * @param {string} dfPath
   * @param {string|undefined} columnName
   * @returns {Promise<any|null>} The column values, or null if
   * the column was not specified or could not be loaded.
   */
  async loadOptionalNumericColumn(dfPath, columnName) {
    if (!columnName) {
      return null;
    }
    try {
      const values = await this.dataSource.loadNumeric(`${dfPath}/${columnName}`);
      return values.data;
    } catch (e) {
      log.warn(`Column ${columnName} not found in dataframe at`, dfPath);
      return null;
    }
  }

  async loadDataFrame(dfPath) {
    const { percentExpressing, meanExpression } = this.options;
    try {
      const [
        featureId,
        featureFoldChange,
        featureSignificance,
        featurePercentExpressing,
        featureMeanExpression,
      ] = await Promise.all([
        this.loadFeatureNames(dfPath),
        this.loadFoldChanges(dfPath),
        this.loadSignificances(dfPath),
        this.loadOptionalNumericColumn(dfPath, percentExpressing),
        this.loadOptionalNumericColumn(dfPath, meanExpression),
      ]);
      return {
        featureId,
        featureFoldChange,
        featureSignificance,
        featurePercentExpressing,
        featureMeanExpression,
      };
    } catch (e) {
      log.warn('Dataframe not found at', dfPath);
      return {
        featureId: [],
        featureFoldChange: [],
        featureSignificance: [],
        featurePercentExpressing: null,
        featureMeanExpression: null,
      };
    }
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
    const { analysisType: targetAnalysisType = 'pydeseq2' } = this.options;
    const { sampleSetSelection, obsSetSelection } = volcanoOptions || {};

    // We expect these set paths to have already been transformed
    // to use the "raw" column names,
    // according to the mappings defined in obsSets and sampleSets loader options.
    // The values in the comparison_metadata have the "raw" column names.
    const rawObsSetSelection = obsSetSelection;
    const rawSampleSetSelection = sampleSetSelection;

    // Zero sample sets: compare obs sets across all samples.
    // One sample set: compare obs sets within the samples of that group.
    // Two sample sets: compare the two sample groups within an obs set.
    const numSampleSets = Array.isArray(sampleSetSelection) ? sampleSetSelection.length : 0;
    if (numSampleSets > 2) {
      if (getDebugMode()) {
        return Promise.reject(new Error('Expected at most two sample sets for volcano plot.'));
      }
      return null;
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
          // analysis_params,
          coordination_values,
          // path,
        } = resultObject;
        if (analysis_type === targetAnalysisType) {
          // This is a diff. exp. result.
          if (numSampleSets === 2) {
            // Comparing two sample groups.
            rawObsSetSelection.forEach((obsSetPath) => {
              if (isEqual([obsSetPath], coordination_values.obsSetFilter)) {
                // The obsSetSelection matches.
                // Now check whether the sampleSetSelection matches.
                if (isMatchingSampleSetFilter(
                  rawSampleSetSelection, coordination_values.sampleSetFilter,
                )) {
                  matchingComparisons.push(resultObject);
                }
              }
            });
          } else {
            // Comparing selected cell type(s) of interest against the rest,
            // either across all samples (no sample groups selected)
            // or within the samples of a single selected sample group.
            // The sampleSetFilter must match exactly, so that results filtered
            // to a different subset of samples are excluded.
            rawObsSetSelection.forEach((obsSetPath) => {
              if (
                isEqual([obsSetPath], coordination_values.obsSetSelection)
                && isMatchingSampleSetFilter(
                  rawSampleSetSelection, coordination_values.sampleSetFilter,
                )
              ) {
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
    return new LoaderResult({ featureStats: result }, null);
  }

  // eslint-disable-next-line class-methods-use-this
  async load() {
    throw new Error('The load() method is not implemented for FeatureStatsAnndataLoader.');
  }
}

import { LoaderResult, AbstractTwoStepLoader, AbstractLoaderError } from '@vitessce/abstract';
import { isEqual } from 'lodash-es';

/** @import AnnDataSource from '../AnnDataSource.js' */
/** @import { FeatureStatsData } from '@vitessce/types' */


/**
 * Do two pairs of paths contain the same two elements,
 * potentially swapped in their order?
 * @param {[string[], string[]]} pathPairA A pair of paths like [["Disease", "Healthy"], ["Disease", "CKD"]]
 * @param {[string[], string[]]} pathPairB A pair of paths like [["Disease", "CKD"], ["Disease", "Healthy"]]
 * @returns {boolean} Whether the two pairs contain the same two paths.
 */
function isEqualPathPair(pathPairA, pathPairB) {
  return (
    (isEqual(pathPairA[0], pathPairB[0]) && isEqual(pathPairA[1], pathPairB[1]))
    || (isEqual(pathPairA[0], pathPairB[1]) && isEqual(pathPairA[1], pathPairB[0]))
  )
}

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
    let values = await this.dataSource.loadNumeric(`${dfPath}/${pValueColumn}`);
    if(pValueTransformation === 'minuslog10') {
      console.log("REVERTING MINUSLOG10")
      // Invert the transformation, to return the plain p-values.
      // The view will do the -Math.log10 transformation if needed.
      values.data = values.data.map(val => Math.pow(10, -val));
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
    let values = await this.dataSource.loadNumeric(`${dfPath}/${foldChangeColumn}`);
    // Invert the transformation
    if(foldChangeTransformation === 'log2') {
      console.log("REVERTING LOG2")
      values.data = values.data.map(val => Math.pow(2, val));
    }
    return values.data;
  }

  async loadFeatureNames(dfPath) {
    const { indexColumn } = this.options;
    // TODO: check the options to determine whether the significance values are pre-transformed
    // or if we still need to compute log2 here.
    return await this.dataSource._loadColumn(`${dfPath}/${indexColumn}`);
  }

  async loadDataFrame(dfPath) {
    const [
      featureId,
      featureFoldChange,
      featureSignificance,
    ] = await Promise.all([
      this.loadFeatureNames(dfPath),
      this.loadFoldChanges(dfPath),
      this.loadSignificances(dfPath),
    ]);
    return {
      featureId,
      featureFoldChange,
      featureSignificance,
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
      // eslint-disable-next-line no-underscore-dangle
      const metadata = JSON.parse(await this.dataSource._loadString(metadataPath));
      if(!(metadata.schema_version === "0.0.1" || metadata.schema_version === "0.0.2")) {
        throw new Error("Unsupported comparison_metadata schema version.");
      }
      this.metadata = metadata;
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
    const { sampleSetSelection, obsSetSelection } = volcanoOptions || {};
    // TODO: If faceting, need to load data from multiple dataframes.

    // We expect these set paths to have already been transformed
    // to use the "raw" column names,
    // according to the mappings defined in obsSets and sampleSets loader options.
    // The values in the comparison_metadata have the "raw" column names.
    const rawObsSetSelection = obsSetSelection;
    const rawSampleSetSelection = sampleSetSelection;

    if (sampleSetSelection) {
      if (sampleSetSelection.length !== 2) {
        return Promise.reject(new Error('Expected exactly two sample sets for volcano plot.'));
      }
    }

    if (!obsSetSelection) {
      return Promise.reject(new Error('Expected obsSetSelection to be present.'));
    }

    const metadata = await this.loadMetadata();

    // Match metadata against to get paths to dataframe(s) of interest.

    // Differential expression results have this analysis_type value.
    const targetAnalysisType = "rank_genes_groups";

    const matchingComparisons = [];
    Object.entries(metadata.comparisons).forEach(([comparisonGroupKey, comparisonGroupObject]) => {
      const { results } = comparisonGroupObject;
      results.forEach((resultObject) => {
        const {
          analysis_type,
          analysis_params,
          coordination_values,
          path,
        } = resultObject;
        if(analysis_type === targetAnalysisType) {
          // This is a diff. exp. result.
          if(sampleSetSelection) {
            // Comparing two sample groups.
            rawObsSetSelection.forEach((obsSetPath) => {
              if(isEqual([obsSetPath], coordination_values.obsSetFilter)) {
                // The obsSetSelection matches.
                // Now check whether the sampleSetSelection matches.
                if(isEqualPathPair(rawSampleSetSelection, coordination_values.sampleSetFilter)) {
                  matchingComparisons.push(resultObject);
                }
              }
            });
          } else if(obsSetSelection) {
            // Comparing no sample groups but have selected cell type(s) of interest.
            rawObsSetSelection.forEach((obsSetPath) => {
              if(isEqual([obsSetPath], coordination_values.obsSetSelection)) {
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
        df: df,
        metadata: comparisonObject,
      };
    }));
    return new LoaderResult({ featureStats: result }, null);
  }

  /**
   *
   * @returns {Promise<LoaderResult<FeatureStatsData>>}
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
      this.loadSignificances(),
      this.loadFoldChanges(),
    ]).then(([featureId, featureSignificance, featureFoldChange]) => Promise.resolve(new LoaderResult(
      {
        featureId,
        featureSignificance,
        featureFoldChange,
        sampleId: null,
        obsSetId: null,
      },
      null,
    )));
  }
}
